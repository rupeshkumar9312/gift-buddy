import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import {
  CurrentAdmin,
  type CurrentAdminPayload,
} from '../auth/decorators/current-admin.decorator';
import { ReturnRequestStatus } from '../../returns/entities/return-request.entity';
import { AdminReturnRequestsService } from './admin-return-requests.service';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';

@Controller('admin/return-requests')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminReturnRequestsController {
  constructor(
    private readonly adminReturnRequestsService: AdminReturnRequestsService,
  ) {}

  @Get()
  @RequirePermissions('orders.read')
  findAll(@Query('status') status?: ReturnRequestStatus) {
    return this.adminReturnRequestsService.findAll(status);
  }

  @Patch(':id')
  @RequirePermissions('orders.write')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReturnRequestDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminReturnRequestsService.updateStatus(id, dto, admin.adminId);
  }
}
