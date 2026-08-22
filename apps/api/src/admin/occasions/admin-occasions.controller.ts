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
import { AdminOccasionsService } from './admin-occasions.service';
import { CreateOccasionDto } from './dto/create-occasion.dto';
import { UpdateOccasionDto } from './dto/update-occasion.dto';
import { CreateOccasionCategoryDto } from './dto/create-occasion-category.dto';
import { UpdateOccasionCategoryDto } from './dto/update-occasion-category.dto';

@Controller('admin/occasions')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminOccasionsController {
  constructor(private readonly adminOccasionsService: AdminOccasionsService) {}

  @Get()
  @RequirePermissions('products.read')
  findAll() {
    return this.adminOccasionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOccasionsService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() dto: CreateOccasionDto) {
    return this.adminOccasionsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOccasionDto,
  ) {
    return this.adminOccasionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('products.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminOccasionsService.remove(id);
  }

  @Post(':id/categories')
  @RequirePermissions('products.write')
  createOccasionCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOccasionCategoryDto,
  ) {
    return this.adminOccasionsService.createOccasionCategory(id, dto);
  }

  @Patch(':id/categories/:categoryId')
  @RequirePermissions('products.write')
  updateOccasionCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: UpdateOccasionCategoryDto,
  ) {
    return this.adminOccasionsService.updateOccasionCategory(
      id,
      categoryId,
      dto,
    );
  }

  @Delete(':id/categories/:categoryId')
  @RequirePermissions('products.write')
  removeOccasionCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.adminOccasionsService.removeOccasionCategory(id, categoryId);
  }
}
