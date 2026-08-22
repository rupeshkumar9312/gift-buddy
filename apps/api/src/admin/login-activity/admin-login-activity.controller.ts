import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { LoginActivityService } from '../../login-activity/login-activity.service';

@Controller('admin/login-activity')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('roles.write')
export class AdminLoginActivityController {
  constructor(private readonly loginActivityService: LoginActivityService) {}

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 25,
  ) {
    return this.loginActivityService.findAll(page, limit);
  }
}
