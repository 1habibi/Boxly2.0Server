import { JwtPayload } from '@auth/interfaces';
import { convertToSecondsUtil } from '@common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  save(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password);
    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        roles: ['USER'],
      },
    });
  }

  async getUserWithProfile(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: { Profile: true },
    });
  }

  async findOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.cacheManager.del(idOrEmail);
    }
    const user = await this.cacheManager.get<User>(idOrEmail);
    if (!user) {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              id: idOrEmail,
            },
            {
              email: idOrEmail,
            },
          ],
        },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')));
      return user;
    }
    return user;
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    await Promise.all([this.cacheManager.del(id), this.cacheManager.del(user.email)]);
    return this.prismaService.user.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async getAllCouriers(): Promise<User[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        roles: {
          has: Role.COURIER,
        },
      },
      include: { Profile: true },
    });
    return users;
  }

  async changeEmail(userId: string, newEmail: string, password: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const passwordIsValid = compareSync(password, user.password);

    if (!passwordIsValid) {
      throw new ForbiddenException('Неверный пароль');
    }

    await this.cacheManager.del(user.email); // Invalidate cache for the old email
    await this.cacheManager.del(userId); // Invalidate cache for the user ID

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    await this.cacheManager.set(newEmail, updatedUser, convertToSecondsUtil(this.configService.get('JWT_EXP'))); // Update cache with new email

    return updatedUser;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const passwordIsValid = compareSync(oldPassword, user.password);

    if (!passwordIsValid) {
      throw new ForbiddenException('Неверный текущий пароль');
    }

    const hashedNewPassword = this.hashPassword(newPassword);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    await this.cacheManager.del(userId); // Invalidate cache for the user ID

    return true;
  }
}
