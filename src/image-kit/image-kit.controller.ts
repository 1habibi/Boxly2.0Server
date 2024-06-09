import { Controller, Get, Res } from '@nestjs/common';
import { ImageKitService } from './image-kit.service';
import { Response } from 'express';
import { Public } from '@common/decorators';

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
