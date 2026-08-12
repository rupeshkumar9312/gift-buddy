import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import {
  OrderDetailResponse,
  OrderSummaryResponse,
  toOrderDetail,
  toOrderSummary,
} from './orders.mapper';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
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

  private async loadDetail(order: Order): Promise<OrderDetailResponse> {
    const [items, statusHistory] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId: order.id } }),
      this.orderStatusHistoryRepository.find({ where: { orderId: order.id } }),
    ]);
    return toOrderDetail(order, items, statusHistory);
  }
}
