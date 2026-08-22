import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftKit } from './entities/gift-kit.entity';
import { GiftKitsController } from './gift-kits.controller';
import { GiftKitsService } from './gift-kits.service';

@Module({
  imports: [TypeOrmModule.forFeature([GiftKit])],
  controllers: [GiftKitsController],
  providers: [GiftKitsService],
})
export class GiftKitsModule {}
