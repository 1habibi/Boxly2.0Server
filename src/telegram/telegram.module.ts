import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { TelegramController } from './telegram.controller';
import { UserModule } from '@user/user.module';

@Module({
  imports: [TelegrafModule.forRootAsync(options()), UserModule],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
