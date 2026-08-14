import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

type MysqlError = { code?: string };

@Injectable()
export class AdminCouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  findAll(): Promise<Coupon[]> {
    return this.couponRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon ${id} not found`);
    }
    return coupon;
  }

  create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepository.create({
      code: dto.code.toUpperCase(),
      type: dto.type,
      value: dto.value.toFixed(2),
      minSubtotal: (dto.minSubtotal ?? 0).toFixed(2),
      startsAt: dto.startsAt ?? null,
      expiresAt: dto.expiresAt ?? null,
      usageLimit: dto.usageLimit ?? null,
      isActive: dto.isActive ?? true,
    });
    return this.save(coupon);
  }

  async update(id: number, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);
    if (dto.code !== undefined) coupon.code = dto.code.toUpperCase();
    if (dto.type !== undefined) coupon.type = dto.type;
    if (dto.value !== undefined) coupon.value = dto.value.toFixed(2);
    if (dto.minSubtotal !== undefined)
      coupon.minSubtotal = dto.minSubtotal.toFixed(2);
    if (dto.startsAt !== undefined) coupon.startsAt = dto.startsAt;
    if (dto.expiresAt !== undefined) coupon.expiresAt = dto.expiresAt;
    if (dto.usageLimit !== undefined) coupon.usageLimit = dto.usageLimit;
    if (dto.isActive !== undefined) coupon.isActive = dto.isActive;
    return this.save(coupon);
  }

  async remove(id: number): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Coupon ${id} not found`);
    }
  }

  private async save(coupon: Coupon): Promise<Coupon> {
    try {
      return await this.couponRepository.save(coupon);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A coupon with that code already exists');
      }
      throw error;
    }
  }
}
