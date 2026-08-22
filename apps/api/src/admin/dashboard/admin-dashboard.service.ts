import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

const REVENUE_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.FULFILLED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];
const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getSummary() {
    const totals = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.status IN (:...statuses)', { statuses: REVENUE_STATUSES })
      .getRawOne<{ revenue: string; orderCount: string }>();

    const revenueNumber = Number(totals?.revenue ?? 0);
    const orderCountNumber = Number(totals?.orderCount ?? 0);
    const aov = orderCountNumber > 0 ? revenueNumber / orderCountNumber : 0;

    const lowStockProducts = await this.productRepository.find({
      where: { isActive: true },
      order: { stockQty: 'ASC' },
      take: 5,
    });

    const recentOrders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      revenue: Math.round(revenueNumber * 100) / 100,
      orderCount: orderCountNumber,
      averageOrderValue: Math.round(aov * 100) / 100,
      lowStockProducts: lowStockProducts
        .filter((p) => p.stockQty <= LOW_STOCK_THRESHOLD)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          stockQty: p.stockQty,
        })),
      recentOrders: recentOrders.map((o) => ({
        orderNumber: o.orderNumber,
        email: o.email,
        status: o.status,
        total: Number(o.total),
        currency: o.currency,
        createdAt: o.createdAt,
      })),
    };
  }
}
