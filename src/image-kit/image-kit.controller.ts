import { Public } from '@common/decorators';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageKitService } from './image-kit.service';

@Public()
@Controller('image-kit')
export class ImageKitController {
  constructor(private readonly imageKitService: ImageKitService) {}

  @Get('auth')
  getAuthParameters(@Res() res: Response) {
    const result = this.imageKitService.getAuthenticationParameters();
    res.send(result);
  }
}
