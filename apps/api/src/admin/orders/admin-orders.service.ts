import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { Product } from '../../products/entities/product.entity';
import { MailService } from '../../mail/mail.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  AdminOrderDetail,
  AdminOrderSummary,
  toAdminOrderDetail,
  toAdminOrderSummary,
} from './admin-orders.mapper';

const RESTOCKING_STATUSES = [OrderStatus.CANCELLED, OrderStatus.REFUNDED];

@Injectable()
export class AdminOrdersService {
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

  async findAll(
    query: AdminOrderQueryDto,
  ): Promise<PaginatedResponse<AdminOrderSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.orderRepository.createQueryBuilder('order');
    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    qb.orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();
    const summaries = await Promise.all(
      orders.map(async (order) => {
        const itemCount = await this.orderItemRepository.count({
          where: { orderId: order.id },
        });
        return toAdminOrderSummary(order, itemCount);
      }),
    );

    return new PaginatedResponse(summaries, total, page, limit);
  }

  async findOne(id: number): Promise<AdminOrderDetail> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const [items, statusHistory] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId: id } }),
      this.orderStatusHistoryRepository.find({ where: { orderId: id } }),
    ]);
    return toAdminOrderDetail(order, items, statusHistory);
  }

  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderDetail> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (order.status === dto.status) {
      return this.findOne(id);
    }

    const previousStatus = order.status;
    const items = await this.orderItemRepository.find({
      where: { orderId: id },
    });

    await this.dataSource.transaction(async (manager) => {
      order.status = dto.status;
      await manager.save(Order, order);

      // Cancelling or refunding an order returns its items to sellable
      // stock — matches the refund flow described in Section 06 of the
      // analysis doc, extended symmetrically to cancellations.
      if (RESTOCKING_STATUSES.includes(dto.status)) {
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
      }

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: id,
          fromStatus: previousStatus,
          toStatus: dto.status,
          note: dto.note ?? null,
        }),
      );
    });

    await this.mailService.sendOrderStatusUpdate({
      to: order.email,
      orderNumber: order.orderNumber,
      status: dto.status,
    });

    return this.findOne(id);
  }
}
