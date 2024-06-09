import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ImageKitModule } from 'src/image-kit/image-kit.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [ImageKitModule, TelegramModule],
})
export class OrderModule {}
