import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

  @Get()
  @RequirePermissions('products.read')
  findAll() {
    return this.adminCategoriesService.findAll();
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() dto: CreateCategoryDto) {
    return this.adminCategoriesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminCategoriesService.remove(id);
  }
}
