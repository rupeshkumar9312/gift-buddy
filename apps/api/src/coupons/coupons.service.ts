import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Coupon, CouponType } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
  ) {}

  /** Resolves and validates a code against a subtotal — used by both cart preview and checkout. */
  async resolve(
    code: string,
    subtotal: number,
    manager?: EntityManager,
  ): Promise<Coupon> {
    const repo = manager
      ? manager.getRepository(Coupon)
      : this.couponsRepository;
    const coupon = await repo.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) {
      throw new NotFoundException('Coupon code not found');
    }
    this.assertValid(coupon, subtotal);
    return coupon;
  }

  assertValid(coupon: Coupon, subtotal: number): void {
    const now = new Date();
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (subtotal < Number(coupon.minSubtotal)) {
      throw new BadRequestException(
        `This coupon requires a subtotal of at least $${Number(coupon.minSubtotal).toFixed(2)}`,
      );
    }
  }

  computeDiscount(coupon: Coupon, subtotal: number): number {
    const raw =
      coupon.type === CouponType.PERCENT
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    return Math.min(Math.round(raw * 100) / 100, subtotal);
  }

  async incrementUsage(
    couponId: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager.increment(Coupon, { id: couponId }, 'timesUsed', 1);
  }
}
