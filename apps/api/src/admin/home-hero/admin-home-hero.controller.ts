import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminHomeHeroService } from './admin-home-hero.service';
import { UpdateHomeHeroDto } from './dto/update-home-hero.dto';

@Controller('admin/home-hero')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminHomeHeroController {
  constructor(private readonly adminHomeHeroService: AdminHomeHeroService) {}

  @Get()
  @RequirePermissions('settings.write')
  get() {
    return this.adminHomeHeroService.get();
  }

  @Patch()
  @RequirePermissions('settings.write')
  update(@Body() dto: UpdateHomeHeroDto) {
    return this.adminHomeHeroService.update(dto);
  }
}
