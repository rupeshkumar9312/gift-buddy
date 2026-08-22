import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminPromoBannersService } from './admin-promo-banners.service';
import { CreatePromoBannerDto } from './dto/create-promo-banner.dto';
import { UpdatePromoBannerDto } from './dto/update-promo-banner.dto';

@Controller('admin/promo-banners')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('settings.write')
export class AdminPromoBannersController {
  constructor(
    private readonly adminPromoBannersService: AdminPromoBannersService,
  ) {}

  @Get()
  findAll() {
    return this.adminPromoBannersService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePromoBannerDto) {
    return this.adminPromoBannersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromoBannerDto,
  ) {
    return this.adminPromoBannersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminPromoBannersService.remove(id);
  }
}
