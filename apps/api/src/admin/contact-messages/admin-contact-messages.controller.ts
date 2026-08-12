import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AdminContactMessagesService } from './admin-contact-messages.service';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@Controller('admin/contact-messages')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
export class AdminContactMessagesController {
  constructor(
    private readonly adminContactMessagesService: AdminContactMessagesService,
  ) {}

  @Get()
  @RequirePermissions('content.read')
  findAll() {
    return this.adminContactMessagesService.findAll();
  }

  @Patch(':id')
  @RequirePermissions('content.write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactMessageDto,
  ) {
    return this.adminContactMessagesService.update(id, dto);
  }
}
