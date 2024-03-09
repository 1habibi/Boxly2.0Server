import { Body, Controller, NotFoundException, Patch, Post, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CurrentUser, Roles } from '@common/decorators';
import { TelegramUserResponse } from './responses';
import { JwtPayload } from '@auth/interfaces';
import { RolesGuard } from '@auth/guards/role.guard';
import { Role } from '@prisma/client';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Patch('link')
  async onLink(@Body() data: TelegramUserResponse, @CurrentUser() user: JwtPayload) {
    const result = await this.telegramService.linkTelegram(data, user);
    if (!result) {
      throw new NotFoundException('Пользователь не найден');
    }
    return result;
  }

  @Patch('unlink')
  async onUnlink(@CurrentUser() user: JwtPayload) {
    return await this.telegramService.unlinkTelegram(user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('send-message')
  async sendMessage(@Body() data: { telegramId: string; message: string }) {
    return await this.telegramService.sendMessageToUser(data.telegramId, data.message);
  }
}
