import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import {
  CurrentUser,
  type CurrentUserPayload,
} from './decorators/current-user.decorator';
import { CART_COOKIE } from '../cart/cart.controller';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const CART_COOKIE_PATH = '/api/v1';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken } = await this.authService.register(
      dto,
      cookies?.[CART_COOKIE],
    );
    this.setRefreshCookie(res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken } = await this.authService.login(
      dto,
      cookies?.[CART_COOKIE],
    );
    this.setRefreshCookie(res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken } =
      await this.authService.authenticateWithGoogle(
        dto.idToken,
        cookies?.[CART_COOKIE],
      );
    this.setRefreshCookie(res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken };
  }

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOtpAndAuth(
        dto.phone,
        dto.code,
        dto.firstName,
        dto.lastName,
        cookies?.[CART_COOKIE],
      );
    this.setRefreshCookie(res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken } = await this.authService.refresh(
      cookies?.[REFRESH_COOKIE],
    );
    this.setRefreshCookie(res, refreshToken);
    return { user, accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    return { success: true };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('nodeEnv') === 'production',
      sameSite: 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: this.config.getOrThrow<number>('jwt.refreshTtlMs'),
    });
  }
}
