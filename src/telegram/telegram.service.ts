import { JwtPayload } from '@auth/interfaces';
import { Public } from '@common/decorators';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { TelegramUserResponse } from './responses';

type Context = Scenes.SceneContext;

@Injectable()
@Update()
export class TelegramService extends Telegraf<Context> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {
    super('6747646023:AAGYgjXE0TQlzwYplzxIkuSOXDOmTxw1Tms');
  }

  @Public()
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(`<b>Привет, ${ctx.from.first_name}</b> Добро пожаловать в Boxly!!`);
  }

  async sendMessageToUser(telegramId: string, message: string) {
    await this.telegram.sendMessage(telegramId, message);
  }

  async linkTelegram(data: TelegramUserResponse, user: JwtPayload) {
    const userId = user.id;
    const telegramId = String(data.id);
    return this.prismaService.profile.update({
      where: { userId },
      data: {
        telegramId,
      },
    });
  }

  async unlinkTelegram(user: JwtPayload) {
    const userData = await this.userService.getUserWithProfile(user.id);
    if (userData && userData.Profile.telegramId) {
      await this.prismaService.profile.update({
        where: { id: userData.Profile.id },
        data: { telegramId: null },
      });
      return { statusCode: 200, message: 'Привязка успешно удалена' };
    } else {
      throw new ConflictException('Ошибка удаления привязки');
    }
  }
}
