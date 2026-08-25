import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import type { ReturnEligibility } from '../returns/returns.service';

export type OrderSummaryResponse = {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
};

export type OrderDetailResponse = OrderSummaryResponse & {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingAddress: Order['shippingAddress'];
  billingAddress: Order['billingAddress'];
  shippingMethodName: string;
  placedAt: Date | null;
  deliveryExtraDays: number | null;
  items: {
    orderItemId: number;
    productName: string;
    productSlug: string | null;
    productImage: string | null;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    returnEligible: boolean;
    returnWindowEndsAt: Date | null;
    returnRequestStatus: string | null;
  }[];
  statusHistory: {
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: Date;
  }[];
};

export function toOrderSummary(
  order: Order,
  itemCount: number,
): OrderSummaryResponse {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    itemCount,
    createdAt: order.createdAt,
  };
}

export function toOrderDetail(
  order: Order,
  items: OrderItem[],
  statusHistory: OrderStatusHistory[],
  eligibilityByItemId: Map<number, ReturnEligibility>,
): OrderDetailResponse {
  return {
    ...toOrderSummary(
      order,
      items.reduce((sum, i) => sum + i.quantity, 0),
    ),
    subtotal: Number(order.subtotal),
    shippingTotal: Number(order.shippingTotal),
    taxTotal: Number(order.taxTotal),
    discountTotal: Number(order.discountTotal),
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    shippingMethodName: order.shippingMethodName,
    placedAt: order.placedAt,
    deliveryExtraDays: order.deliveryExtraDays,
    items: items.map((item) => {
      const eligibility = eligibilityByItemId.get(item.id);
      return {
        orderItemId: item.id,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        sku: item.sku,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
        returnEligible: eligibility?.eligible ?? false,
        returnWindowEndsAt: eligibility?.windowEndsAt ?? null,
        returnRequestStatus: eligibility?.requestStatus ?? null,
      };
    }),
    statusHistory: statusHistory
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        createdAt: h.createdAt,
      })),
  };
}
