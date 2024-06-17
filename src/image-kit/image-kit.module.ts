import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageKitController } from './image-kit.controller';
import { ImageKitService } from './image-kit.service';

@Module({
  controllers: [ImageKitController],
  providers: [ImageKitService],
  imports: [ConfigModule],
  exports: [ImageKitService],
})
export class ImageKitModule {}
