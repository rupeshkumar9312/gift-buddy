import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderDetailResponse, toOrderDetail } from '../../orders/orders.mapper';

export type AdminOrderSummary = {
  id: number;
  orderNumber: string;
  email: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  paymentProvider: string | null;
  paymentStatus: string | null;
  createdAt: Date;
};

export type AdminOrderDetail = OrderDetailResponse & {
  id: number;
  email: string;
  paymentProvider: string | null;
  paymentStatus: string | null;
};

export function toAdminOrderSummary(
  order: Order,
  itemCount: number,
  payment: Payment | null,
): AdminOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    itemCount,
    paymentProvider: payment?.provider ?? null,
    paymentStatus: payment?.status ?? null,
    createdAt: order.createdAt,
  };
}

export function toAdminOrderDetail(
  order: Order,
  items: OrderItem[],
  statusHistory: OrderStatusHistory[],
  payment: Payment | null,
): AdminOrderDetail {
  return {
    ...toOrderDetail(order, items, statusHistory),
    id: order.id,
    email: order.email,
    paymentProvider: payment?.provider ?? null,
    paymentStatus: payment?.status ?? null,
  };
}
