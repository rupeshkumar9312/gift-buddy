import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { LoginActivityService } from '../login-activity/login-activity.service';
import { LoginActorType } from '../login-activity/entities/login-activity.entity';
import { AttachGpsLocationDto } from '../login-activity/dto/attach-gps-location.dto';
import { getClientIp } from '../login-activity/ip.util';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/auth';
const CART_COOKIE_PATH = '/api/v1';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly loginActivityService: LoginActivityService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken, loginActivityId } =
      await this.authService.register(
        dto,
        cookies?.[CART_COOKIE],
        this.requestContext(req),
      );
    this.setRefreshCookie(req, res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken, loginActivityId };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken, loginActivityId } =
      await this.authService.login(
        dto,
        cookies?.[CART_COOKIE],
        this.requestContext(req),
      );
    this.setRefreshCookie(req, res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken, loginActivityId };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { user, accessToken, refreshToken, loginActivityId } =
      await this.authService.authenticateWithGoogle(
        dto.idToken,
        cookies?.[CART_COOKIE],
        this.requestContext(req),
      );
    this.setRefreshCookie(req, res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken, loginActivityId };
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
    const { user, accessToken, refreshToken, loginActivityId } =
      await this.authService.verifyOtpAndAuth(
        dto.phone,
        dto.code,
        dto.firstName,
        dto.lastName,
        cookies?.[CART_COOKIE],
        this.requestContext(req),
      );
    this.setRefreshCookie(req, res, refreshToken);
    if (cookies?.[CART_COOKIE]) {
      res.clearCookie(CART_COOKIE, { path: CART_COOKIE_PATH });
    }
    return { user, accessToken, loginActivityId };
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
    this.setRefreshCookie(req, res, refreshToken);
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

  // Called moments after login/register/sign-in, only if the browser grants
  // the geolocation permission prompt — upgrades that login's audit row from
  // its IP-based location to a precise GPS fix.
  @Patch('login-activity/:id/location')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  async attachLoginLocation(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AttachGpsLocationDto,
  ) {
    await this.loginActivityService.attachGpsLocation(
      id,
      { actorType: LoginActorType.CUSTOMER, userId: user.userId },
      dto,
    );
    return { success: true };
  }

  private requestContext(req: Request) {
    return {
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] ?? null,
    };
  }

  private setRefreshCookie(req: Request, res: Response, refreshToken: string) {
    // The web frontend and this API commonly live on different sites (e.g. a
    // local dev frontend calling the deployed Render API, or a Vercel
    // frontend calling a Render API) — `SameSite=Lax` cookies are never sent
    // back on cross-site fetch/XHR calls, only on top-level navigations, so
    // the session would silently fail to persist. `SameSite=None` is
    // required for that cross-site case and itself requires `Secure`, which
    // only works over HTTPS.
    //
    // This used to key off NODE_ENV === 'production', but that's only ever
    // as reliable as whoever configured the deploy remembering to set it —
    // Render doesn't inject it automatically for every service type, and it
    // silently wasn't set here, so every session kept dying on refresh
    // no matter how many times the "fix" got redeployed. `req.secure`
    // reflects reality directly: with `trust proxy` enabled (main.ts), it
    // reads the `X-Forwarded-Proto` header Render/Cloudflare actually set
    // for this specific request, so it's correct regardless of any env var.
    const isHttps = req.secure;
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: this.config.getOrThrow<number>('jwt.refreshTtlMs'),
    });
  }
}
