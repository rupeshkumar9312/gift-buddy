import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity';
import {
  ReturnRequest,
  ReturnRequestStatus,
} from './entities/return-request.entity';

export type ReturnEligibility = {
  eligible: boolean;
  windowEndsAt: Date | null;
  requestStatus: ReturnRequestStatus | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRequestRepository: Repository<ReturnRequest>,
  ) {}

  // The order can't have been delivered more than once in the normal flow,
  // but taking the most recent 'delivered' entry (rather than assuming
  // there's exactly one) keeps this safe if a status ever gets corrected.
  deliveredAt(statusHistory: OrderStatusHistory[]): Date | null {
    const delivered = statusHistory
      .filter((h) => h.toStatus === 'delivered')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return delivered[0]?.createdAt ?? null;
  }

  async findForOrder(orderId: number): Promise<ReturnRequest[]> {
    return this.returnRequestRepository.find({ where: { orderId } });
  }

  // A return request is a one-time action per line item, regardless of how
  // it's resolved — once submitted (even if later rejected), that item is
  // done; it doesn't reopen a new eligibility window. Keeps the lifecycle
  // simple and matches how a real support conversation would work: a
  // rejected request gets discussed with support, not silently resubmitted.
  eligibility(
    item: OrderItem,
    deliveredAt: Date | null,
    existingRequest: ReturnRequest | undefined,
    now: Date = new Date(),
  ): ReturnEligibility {
    if (existingRequest) {
      return {
        eligible: false,
        windowEndsAt: null,
        requestStatus: existingRequest.status,
      };
    }

    if (!item.returnDays || item.returnDays <= 0 || !deliveredAt) {
      return { eligible: false, windowEndsAt: null, requestStatus: null };
    }

    const windowEndsAt = new Date(
      deliveredAt.getTime() + item.returnDays * MS_PER_DAY,
    );
    return {
      eligible: now.getTime() <= windowEndsAt.getTime(),
      windowEndsAt,
      requestStatus: null,
    };
  }

  async createRequest(params: {
    order: Order;
    item: OrderItem;
    statusHistory: OrderStatusHistory[];
    quantity: number;
    reason: string;
  }): Promise<ReturnRequest> {
    const { order, item, statusHistory, quantity, reason } = params;

    const existing = await this.returnRequestRepository.findOne({
      where: { orderItemId: item.id },
    });
    const { eligible } = this.eligibility(
      item,
      this.deliveredAt(statusHistory),
      existing ?? undefined,
    );
    if (!eligible) {
      throw new BadRequestException(
        'This item is not eligible for a return request.',
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > item.quantity
    ) {
      throw new BadRequestException(
        `Quantity must be between 1 and ${item.quantity}.`,
      );
    }

    return this.returnRequestRepository.save(
      this.returnRequestRepository.create({
        orderId: order.id,
        orderItemId: item.id,
        quantity,
        reason,
        status: ReturnRequestStatus.REQUESTED,
      }),
    );
  }
}
