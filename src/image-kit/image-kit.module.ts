import { Module } from '@nestjs/common';
import { ImageKitController } from './image-kit.controller';
import { ImageKitService } from './image-kit.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ImageKitController],
  providers: [ImageKitService],
  imports: [ConfigModule],
  exports: [ImageKitService],
})
export class ImageKitModule {}
