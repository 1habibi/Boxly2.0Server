import { JwtPayload } from '@auth/interfaces';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getAllProfiles(): Promise<Profile[]> {
    return this.prismaService.profile.findMany();
  }

  async getProfileById(id: string): Promise<Profile> {
    return this.prismaService.profile.findUnique({ where: { id } });
  }

  async getProfileByUserId(userId: string): Promise<Profile> | null {
    const profile = await this.prismaService.profile.findUnique({ where: { userId } });
    if (!profile) {
      return null;
    }
    return profile;
  }

  async createProfile(data: Partial<Profile>, user: JwtPayload) {
    const userId = user.id;
    return this.prismaService.profile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateProfile(data: Partial<Profile>, profileId: string) {
    const profile = await this.prismaService.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new ConflictException(`Профиль с таким id не найден`);
    }
    return this.prismaService.profile
      .update({
        where: {
          id: profileId,
        },
        data,
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
