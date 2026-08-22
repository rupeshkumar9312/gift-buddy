import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

const REFRESH_COOKIE = 'admin_refresh_token';
const REFRESH_COOKIE_PATH = '/api/v1/admin/auth';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { admin, accessToken, refreshToken } =
      await this.adminAuthService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { admin, accessToken };
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
