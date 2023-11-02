import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get('JST_EXP', '5m'),
  },
});
export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => jwtModuleOptions(config),
});