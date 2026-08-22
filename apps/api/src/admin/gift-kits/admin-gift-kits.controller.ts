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
import { AdminGiftKitsService } from './admin-gift-kits.service';
import { CreateGiftKitDto } from './dto/create-gift-kit.dto';
import { UpdateGiftKitDto } from './dto/update-gift-kit.dto';

@Controller('admin/gift-kits')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('settings.write')
export class AdminGiftKitsController {
  constructor(private readonly adminGiftKitsService: AdminGiftKitsService) {}

  @Get()
  findAll() {
    return this.adminGiftKitsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGiftKitDto) {
    return this.adminGiftKitsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGiftKitDto) {
    return this.adminGiftKitsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminGiftKitsService.remove(id);
  }
}
