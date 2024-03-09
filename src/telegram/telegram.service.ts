import { Public } from '@common/decorators';
import { Ctx, Hears, Start, Update } from 'nestjs-telegraf';
import { Telegraf, Scenes } from 'telegraf';
import { TelegramUserResponse } from './responses';
import { JwtPayload } from '@auth/interfaces';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';

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
    await ctx.replyWithHTML(`<b>Привет, ${ctx.from.first_name}</b> Cкинь кружочек с мордочкой :з`);
  }
  @Public()
  @Hears('test')
  async onHello(@Ctx() ctx: Context) {
    await ctx.telegram.sendMessage('508331938', 'yoyoyoyoyooyoy');
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

  async sendMessageToUser(telegramId: string, message: string) {
    await this.telegram.sendMessage(telegramId, message);
  }
}
