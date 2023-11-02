import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { AuthService } from '@auth/auth.service';
import { Tokens } from '@auth/interfaces';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, UserAgent } from '@common/decorators';

const REFRESH_TOKEN = 'refreshtoken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(`Не получается зарегистрировать пользователя с данными ${JSON.stringify(dto)}`);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
    const tokens = await this.authService.login(dto, agent);
    if (!tokens) {
      throw new BadRequestException(`Не получается логин пользователя с данными ${JSON.stringify(dto)}`);
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Get('refresh-tokens')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException();
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}