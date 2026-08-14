import { Module } from '@nestjs/common';
import { AdminMediaController } from './admin-media.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [AdminMediaController],
  providers: [CloudinaryService],
})
export class AdminMediaModule {}
