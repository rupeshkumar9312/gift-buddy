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
import {
  ReturnsService,
  type ReturnEligibility,
} from '../returns/returns.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
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
    private readonly returnsService: ReturnsService,
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

  async requestReturn(
    orderNumber: string,
    orderItemId: number,
    userId: number | null,
    dto: CreateReturnRequestDto,
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
    } else if (
      !dto.email ||
      order.email.toLowerCase() !== dto.email.toLowerCase()
    ) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    const item = await this.orderItemRepository.findOne({
      where: { id: orderItemId, orderId: order.id },
    });
    if (!item) {
      throw new NotFoundException(`Order item ${orderItemId} not found`);
    }

    const statusHistory = await this.orderStatusHistoryRepository.find({
      where: { orderId: order.id },
    });

    await this.returnsService.createRequest({
      order,
      item,
      statusHistory,
      quantity: dto.quantity ?? item.quantity,
      reason: dto.reason,
    });

    await this.mailService.sendReturnRequestUpdate({
      to: order.email,
      orderNumber: order.orderNumber,
      productName: item.productName,
      status: 'requested',
    });

    return this.loadDetail(order);
  }

  private async loadDetail(order: Order): Promise<OrderDetailResponse> {
    const [items, statusHistory, returnRequests] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId: order.id } }),
      this.orderStatusHistoryRepository.find({ where: { orderId: order.id } }),
      this.returnsService.findForOrder(order.id),
    ]);

    const requestsByItemId = new Map(
      returnRequests.map((r) => [r.orderItemId, r]),
    );
    const deliveredAt = this.returnsService.deliveredAt(statusHistory);
    const eligibilityByItemId = new Map<number, ReturnEligibility>(
      items.map((item) => [
        item.id,
        this.returnsService.eligibility(
          item,
          deliveredAt,
          requestsByItemId.get(item.id),
        ),
      ]),
    );

    return toOrderDetail(order, items, statusHistory, eligibilityByItemId);
  }
}
