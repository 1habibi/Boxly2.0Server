import { Module } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [TelegrafModule.forRootAsync(options()), UserModule],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
