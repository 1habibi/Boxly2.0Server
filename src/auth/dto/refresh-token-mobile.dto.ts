import { IsString } from 'class-validator';

export class RefreshTokenMobileDto {
  @IsString()
  refreshToken: string;
}
