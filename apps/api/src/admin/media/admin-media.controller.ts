import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtAccessGuard } from '../auth/guards/admin-jwt-access.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CloudinaryService } from './cloudinary.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('admin/media')
@UseGuards(AdminJwtAccessGuard, PermissionsGuard)
@RequirePermissions('media.write')
export class AdminMediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Deliberately doesn't create a MediaAsset row — it just uploads the file
  // and hands back a URL, exactly like pasting an already-hosted URL. The
  // product/category/blog save flows already create MediaAsset rows from
  // whatever URL they're given, so doing it here too would leave an
  // orphaned duplicate every time a product is saved.
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              `Unsupported file type "${file.mimetype}" — upload a JPEG, PNG, WebP, or GIF image.`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }
    return this.cloudinaryService.uploadImage(file.buffer, file.mimetype);
  }
}
