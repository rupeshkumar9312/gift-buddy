import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminOutOfAreaOrdersService } from './admin-out-of-area-orders.service';

@Controller('admin/out-of-area-orders')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminOutOfAreaOrdersController {
  constructor(
    private readonly adminOutOfAreaOrdersService: AdminOutOfAreaOrdersService,
  ) {}

  @Get()
  @RequirePermissions('orders.read')
  findAll() {
    return this.adminOutOfAreaOrdersService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('orders.write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminOutOfAreaOrdersService.remove(id);
  }
}
