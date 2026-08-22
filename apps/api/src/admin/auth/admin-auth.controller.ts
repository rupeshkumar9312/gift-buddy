import {
  Body,
  Controller,
  Get,
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
import type { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtAccessGuard } from './guards/admin-jwt-access.guard';
import {
  CurrentAdmin,
  type CurrentAdminPayload,
} from './decorators/current-admin.decorator';
import { LoginActivityService } from '../../login-activity/login-activity.service';
import { LoginActorType } from '../../login-activity/entities/login-activity.entity';
import { AttachGpsLocationDto } from '../../login-activity/dto/attach-gps-location.dto';
import { getClientIp } from '../../login-activity/ip.util';

const REFRESH_COOKIE = 'admin_refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/admin/auth';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly config: ConfigService,
    private readonly loginActivityService: LoginActivityService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { admin, accessToken, refreshToken, loginActivityId } =
      await this.adminAuthService.login(dto, {
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      });
    this.setRefreshCookie(res, refreshToken);
    return { admin, accessToken, loginActivityId };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const { admin, accessToken, refreshToken } =
      await this.adminAuthService.refresh(cookies?.[REFRESH_COOKIE]);
    this.setRefreshCookie(res, refreshToken);
    return { admin, accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAccessGuard)
  async logout(
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.adminAuthService.logout(admin.adminId);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    return { success: true };
  }

  // Called moments after login, only if the browser grants the geolocation
  // permission prompt — upgrades that login's audit row from its IP-based
  // location to a precise GPS fix.
  @Patch('login-activity/:id/location')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAccessGuard)
  async attachLoginLocation(
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AttachGpsLocationDto,
  ) {
    await this.loginActivityService.attachGpsLocation(
      id,
      { actorType: LoginActorType.ADMIN, adminUserId: admin.adminId },
      dto,
    );
    return { success: true };
  }

  @Get('me')
  @UseGuards(AdminJwtAccessGuard)
  me(@CurrentAdmin() admin: CurrentAdminPayload) {
    return this.adminAuthService.me(admin.adminId);
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    // See the matching comment in auth.controller.ts — SameSite=Lax cookies
    // never round-trip on cross-site fetch calls (a local admin dev server
    // calling the deployed API, for instance), so this needs None+Secure
    // whenever the API is served over HTTPS.
    const isProduction = this.config.get<string>('nodeEnv') === 'production';
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
      maxAge: this.config.getOrThrow<number>('adminJwt.refreshTtlMs'),
    });
  }
}
