import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '../../../orders/entities/order.entity';

// pending_payment and paid are payment-lifecycle states driven only by the
// Stripe webhook (see CheckoutService.confirmPaymentSucceeded) — an admin
// can only move an order forward from there, or cancel/refund it.
export const ADMIN_SETTABLE_STATUSES = [
  OrderStatus.FULFILLED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const;

export class UpdateOrderStatusDto {
  @IsIn(ADMIN_SETTABLE_STATUSES)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;
}
