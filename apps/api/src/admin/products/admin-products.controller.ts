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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminProductsService } from './admin-products.service';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @RequirePermissions('products.read')
  findAll(@Query() query: AdminProductQueryDto) {
    return this.adminProductsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.findOne(id);
  }

  @Post()
  @RequirePermissions('products.write')
  create(@Body() dto: CreateProductDto) {
    return this.adminProductsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products.write')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.adminProductsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('products.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.remove(id);
  }
}
