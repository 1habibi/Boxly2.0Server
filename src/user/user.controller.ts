import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { UserResponse } from '@user/responses';
import { CurrentUser, Roles } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces';
import { RolesGuard } from '@auth/guards/role.guard';
import { Role, User } from '@prisma/client';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('couriers')
  async getAllCouriers(): Promise<User[]> {
    try {
      const couriers = await this.userService.getAllCouriers();
      return couriers;
    } catch (error) {
      throw new NotFoundException('Ошибка полученя списка курьеров');
    }
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all')
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userService.getAllUsers();
      return users;
    } catch (error) {
      throw new NotFoundException('Ошибка полученя пользователей');
    }
  }

  @Get('user-with-profile')
  async getUserWithProfile(@CurrentUser() user: JwtPayload) {
    const userWithProfile = await this.userService.getUserWithProfile(user.id);
    if (!userWithProfile) {
      throw new NotFoundException('Пользователь не найден');
    }
    return new UserResponse(userWithProfile);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async findOneUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.findOne(idOrEmail);
    return new UserResponse(user);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.userService.delete(id, user);
  }

  @Get()
  currentUser(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Patch(':id/email-change')
  async changeUserEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeEmailDto: ChangeEmailDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Вы не можете изменять электронную почту другого пользователя');
    }

    const updatedUser = await this.userService.changeEmail(id, changeEmailDto.newEmail, changeEmailDto.password);
    return new UserResponse(updatedUser);
  }

  @Patch(':id/password-change')
  async changeUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Вы не можете изменять пароль другого пользователя');
    }

    await this.userService.changePassword(id, changePasswordDto.oldPassword, changePasswordDto.newPassword);
    return { message: 'Пароль успешно изменен' };
  }
}
