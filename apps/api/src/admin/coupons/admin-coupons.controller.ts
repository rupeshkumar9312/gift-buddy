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
import { AdminCouponsService } from './admin-coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('admin/coupons')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('marketing.write')
export class AdminCouponsController {
  constructor(private readonly adminCouponsService: AdminCouponsService) {}

  @Get()
  findAll() {
    return this.adminCouponsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.adminCouponsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.adminCouponsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.remove(id);
  }
}
