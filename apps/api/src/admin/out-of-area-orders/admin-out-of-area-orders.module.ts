import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutOfAreaOrder } from '../../out-of-area-orders/entities/out-of-area-order.entity';
import { AdminOutOfAreaOrdersController } from './admin-out-of-area-orders.controller';
import { AdminOutOfAreaOrdersService } from './admin-out-of-area-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([OutOfAreaOrder])],
  controllers: [AdminOutOfAreaOrdersController],
  providers: [AdminOutOfAreaOrdersService],
})
export class AdminOutOfAreaOrdersModule {}
