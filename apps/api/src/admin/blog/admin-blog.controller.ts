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
import {
  CurrentAdmin,
  type CurrentAdminPayload,
} from '../auth/decorators/current-admin.decorator';
import { AdminBlogService } from './admin-blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Controller('admin/blog')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('content.write')
export class AdminBlogController {
  constructor(private readonly adminBlogService: AdminBlogService) {}

  @Get()
  findAll() {
    return this.adminBlogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminBlogService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminBlogService.create(dto, admin.adminId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.adminBlogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminBlogService.remove(id);
  }
}
