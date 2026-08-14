import {
  Body,
  Controller,
  Get,
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
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @RequirePermissions('orders.read')
  findAll(@Query() query: AdminOrderQueryDto) {
    return this.adminOrdersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('orders.read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrdersService.findOne(id);
  }

  @Patch(':id/status')
  @RequirePermissions('orders.write')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminOrdersService.updateStatus(id, dto);
  }

  @Post(':id/mark-cod-collected')
  @RequirePermissions('orders.write')
  markCodCollected(@Param('id', ParseIntPipe) id: number) {
    return this.adminOrdersService.markCodPaymentCollected(id);
  }
}
