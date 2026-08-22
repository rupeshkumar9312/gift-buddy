import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftKit } from '../../gift-kits/entities/gift-kit.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminGiftKitsController } from './admin-gift-kits.controller';
import { AdminGiftKitsService } from './admin-gift-kits.service';

@Module({
  imports: [TypeOrmModule.forFeature([GiftKit, MediaAsset])],
  controllers: [AdminGiftKitsController],
  providers: [AdminGiftKitsService],
})
export class AdminGiftKitsModule {}
