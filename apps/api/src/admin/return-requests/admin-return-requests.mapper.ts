import { ReturnRequest } from '../../returns/entities/return-request.entity';

export type AdminReturnRequestSummary = {
  id: number;
  orderId: number;
  orderNumber: string;
  customerEmail: string;
  productName: string;
  sku: string;
  quantity: number;
  reason: string;
  status: string;
  adminNote: string | null;
  requestedAt: Date;
  resolvedAt: Date | null;
};

export function toAdminReturnRequestSummary(
  request: ReturnRequest,
): AdminReturnRequestSummary {
  return {
    id: request.id,
    orderId: request.orderId,
    orderNumber: request.order.orderNumber,
    customerEmail: request.order.email,
    productName: request.orderItem.productName,
    sku: request.orderItem.sku,
    quantity: request.quantity,
    reason: request.reason,
    status: request.status,
    adminNote: request.adminNote,
    requestedAt: request.createdAt,
    resolvedAt: request.resolvedAt,
  };
}
