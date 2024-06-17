import { sessionMiddleware } from '@common/middlewares/session.middleware';
import { ConfigService } from '@nestjs/config';
import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from 'nestjs-telegraf';

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
