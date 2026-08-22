import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutOfAreaOrder } from './entities/out-of-area-order.entity';
import { OutOfAreaOrdersController } from './out-of-area-orders.controller';
import { OutOfAreaOrdersService } from './out-of-area-orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([OutOfAreaOrder])],
  controllers: [OutOfAreaOrdersController],
  providers: [OutOfAreaOrdersService],
})
export class OutOfAreaOrdersModule {}
