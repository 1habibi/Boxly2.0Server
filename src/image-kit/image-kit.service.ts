import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const ImageKit = require('imagekit');

@Injectable()
export class ImageKitService {
  private imageKit;

  constructor(private configService: ConfigService) {
    this.imageKit = new ImageKit({
      publicKey: this.configService.get('IMAGEKIT_PUBLIC_KEY'),
      privateKey: this.configService.get('IMAGEKIT_PRIVATE_KEY'),
      urlEndpoint: `https://ik.imagekit.io/${this.configService.get('IMAGEKIT_ID')}`,
    });
  }

  getAuthenticationParameters() {
    return this.imageKit.getAuthenticationParameters();
  }

  async uploadImage(file: Express.Multer.File) {
    const result = await this.imageKit.upload({
      file: file.buffer, // file buffer
      fileName: file.originalname, // file name
    });
    return result;
  }
}
