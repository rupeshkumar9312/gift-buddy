import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { Product } from '../../products/entities/product.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { MailModule } from '../../mail/mail.module';
import { CheckoutModule } from '../../checkout/checkout.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderStatusHistory,
      Product,
      Payment,
    ]),
    MailModule,
    CheckoutModule,
  ],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
})
export class AdminOrdersModule {}
