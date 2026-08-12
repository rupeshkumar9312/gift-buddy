import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { OrderDetailResponse, toOrderDetail } from '../../orders/orders.mapper';

export type AdminOrderSummary = {
  id: number;
  orderNumber: string;
  email: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
};

export type AdminOrderDetail = OrderDetailResponse & {
  id: number;
  email: string;
};

export function toAdminOrderSummary(
  order: Order,
  itemCount: number,
): AdminOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    itemCount,
    createdAt: order.createdAt,
  };
}

export function toAdminOrderDetail(
  order: Order,
  items: OrderItem[],
  statusHistory: OrderStatusHistory[],
): AdminOrderDetail {
  return {
    ...toOrderDetail(order, items, statusHistory),
    id: order.id,
    email: order.email,
  };
}
