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
import { AdminSaleBannersService } from './admin-sale-banners.service';
import { CreateSaleBannerDto } from './dto/create-sale-banner.dto';
import { UpdateSaleBannerDto } from './dto/update-sale-banner.dto';

@Controller('admin/sale-banners')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('settings.write')
export class AdminSaleBannersController {
  constructor(
    private readonly adminSaleBannersService: AdminSaleBannersService,
  ) {}

  @Get()
  findAll() {
    return this.adminSaleBannersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSaleBannerDto) {
    return this.adminSaleBannersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSaleBannerDto,
  ) {
    return this.adminSaleBannersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminSaleBannersService.remove(id);
  }
}
