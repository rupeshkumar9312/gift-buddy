import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { Product } from '../products/entities/product.entity';
import { MailService } from '../mail/mail.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import {
  OrderDetailResponse,
  OrderSummaryResponse,
  toOrderDetail,
  toOrderSummary,
} from './orders.mapper';

// A customer can only self-serve cancel before the order has shipped —
// once it's fulfilled/completed (or already cancelled/refunded), that's a
// support conversation, not a self-service action.
const CUSTOMER_CANCELLABLE_STATUSES = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    private readonly mailService: MailService,
  ) {}

  async findForUser(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<OrderSummaryResponse>> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const summaries = await Promise.all(
      orders.map(async (order) => {
        const itemCount = await this.orderItemRepository.count({
          where: { orderId: order.id },
        });
        return toOrderSummary(order, itemCount);
      }),
    );

    return new PaginatedResponse(summaries, total, page, limit);
  }

  async findDetailForUser(
    userId: number,
    orderNumber: string,
  ): Promise<OrderDetailResponse> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.loadDetail(order);
  }

  async track(
    orderNumber: string,
    email: string,
  ): Promise<OrderDetailResponse> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
    });
    if (!order || order.email.toLowerCase() !== email.toLowerCase()) {
      throw new NotFoundException(
        'No order found for that order number and email',
      );
    }
    return this.loadDetail(order);
  }

  async cancel(
    orderNumber: string,
    userId: number | null,
    email: string | undefined,
  ): Promise<OrderDetailResponse> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    if (userId !== null) {
      if (order.userId !== userId) {
        throw new ForbiddenException();
      }
    } else if (!email || order.email.toLowerCase() !== email.toLowerCase()) {
      // Same not-found response as an unmatched email would give — doesn't
      // confirm to an anonymous caller whether the order number exists.
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Orders that are ${order.status.replace(/_/g, ' ')} can no longer be cancelled — contact support for help.`,
      );
    }

    // Every order reserves its stock at checkout time now (card and COD
    // alike — see CheckoutService.checkout()), so any order reachable here
    // (still PENDING_PAYMENT or PAID) always has its stock currently held.
    const previousStatus = order.status;
    const items = await this.orderItemRepository.find({
      where: { orderId: order.id },
    });

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        if (item.productId) {
          await manager.increment(
            Product,
            { id: item.productId },
            'stockQty',
            item.quantity,
          );
        }
      }

      order.status = OrderStatus.CANCELLED;
      await manager.save(Order, order);

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: order.id,
          fromStatus: previousStatus,
          toStatus: OrderStatus.CANCELLED,
          note: 'Cancelled by customer',
        }),
      );
    });

    await this.mailService.sendOrderStatusUpdate({
      to: order.email,
      orderNumber: order.orderNumber,
      status: OrderStatus.CANCELLED,
    });

    return this.loadDetail(order);
  }

  private async loadDetail(order: Order): Promise<OrderDetailResponse> {
    const [items, statusHistory] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId: order.id } }),
      this.orderStatusHistoryRepository.find({ where: { orderId: order.id } }),
    ]);
    return toOrderDetail(order, items, statusHistory);
  }
}
