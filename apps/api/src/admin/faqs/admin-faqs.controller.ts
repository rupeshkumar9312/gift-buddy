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
import { AdminFaqsService } from './admin-faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('admin/faqs')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('content.write')
export class AdminFaqsController {
  constructor(private readonly adminFaqsService: AdminFaqsService) {}

  @Get()
  findAll() {
    return this.adminFaqsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.adminFaqsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.adminFaqsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminFaqsService.remove(id);
  }
}
