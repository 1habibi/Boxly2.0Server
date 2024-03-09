import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { sessionMiddleware } from '@common/middlewares/session.middleware';

const telegrafModuleOptions = (config: ConfigService): TelegrafModuleOptions => {
  return {
    token: config.get('TELEGRAM_API'),
    botName: 'boxly_bot',
    middlewares: [sessionMiddleware],
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => telegrafModuleOptions(config),
  };
};
