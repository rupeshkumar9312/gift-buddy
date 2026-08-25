import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../../orders/entities/order-status-history.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderDetailResponse, toOrderDetail } from '../../orders/orders.mapper';
import type { ReturnEligibility } from '../../returns/returns.service';

export type AdminOrderSummary = {
  id: number;
  orderNumber: string;
  email: string;
  // From the checkout shipping address, not the customer's account — the
  // only place a phone number is reliably captured regardless of how they
  // signed in (Google accounts, for instance, never have User.phone set).
  phone: string | null;
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
    phone: order.shippingAddress?.phone ?? null,
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
  eligibilityByItemId: Map<number, ReturnEligibility>,
): AdminOrderDetail {
  return {
    ...toOrderDetail(order, items, statusHistory, eligibilityByItemId),
    id: order.id,
    email: order.email,
    paymentProvider: payment?.provider ?? null,
    paymentStatus: payment?.status ?? null,
  };
}
