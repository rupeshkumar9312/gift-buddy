import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { Product } from '../../products/entities/product.entity';
import { Payment, PaymentStatus } from '../../payments/entities/payment.entity';
import { MailService } from '../../mail/mail.service';
import { CheckoutService } from '../../checkout/checkout.service';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateAdminOrderDto } from './dto/create-admin-order.dto';
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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mailService: MailService,
    private readonly checkoutService: CheckoutService,
  ) {}

  async createOrder(dto: CreateAdminOrderDto): Promise<AdminOrderDetail> {
    const order = await this.checkoutService.createManualOrder(dto);
    return this.findOne(order.id);
  }

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
    const payments = orders.length
      ? await this.paymentRepository.find({
          where: orders.map((order) => ({ orderId: order.id })),
        })
      : [];
    const paymentsByOrderId = new Map(payments.map((p) => [p.orderId, p]));

    const summaries = await Promise.all(
      orders.map(async (order) => {
        const itemCount = await this.orderItemRepository.count({
          where: { orderId: order.id },
        });
        return toAdminOrderSummary(
          order,
          itemCount,
          paymentsByOrderId.get(order.id) ?? null,
        );
      }),
    );

    return new PaginatedResponse(summaries, total, page, limit);
  }

  async findOne(id: number): Promise<AdminOrderDetail> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const [items, statusHistory, payment] = await Promise.all([
      this.orderItemRepository.find({ where: { orderId: id } }),
      this.orderStatusHistoryRepository.find({ where: { orderId: id } }),
      this.paymentRepository.findOne({ where: { orderId: id } }),
    ]);
    return toAdminOrderDetail(order, items, statusHistory, payment ?? null);
  }

  /** Records that cash was collected on delivery — touches only the Payment
   * row, deliberately leaving Order.status alone so it can't clobber a
   * fulfillment state (e.g. completed) reached before cash was collected. */
  async markCodPaymentCollected(id: number): Promise<AdminOrderDetail> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId: id },
    });
    if (!payment) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (payment.provider !== 'cod') {
      throw new BadRequestException(
        'Only Cash on Delivery orders can be marked collected this way.',
      );
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      return this.findOne(id);
    }

    payment.status = PaymentStatus.SUCCEEDED;
    await this.paymentRepository.save(payment);

    return this.findOne(id);
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
