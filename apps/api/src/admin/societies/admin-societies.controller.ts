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
import { AdminSocietiesService } from './admin-societies.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';

@Controller('admin/societies')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('settings.write')
export class AdminSocietiesController {
  constructor(private readonly adminSocietiesService: AdminSocietiesService) {}

  @Get()
  findAll() {
    return this.adminSocietiesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSocietyDto) {
    return this.adminSocietiesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSocietyDto) {
    return this.adminSocietiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminSocietiesService.remove(id);
  }
}
