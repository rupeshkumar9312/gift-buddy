import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CouponType } from '../../../coupons/entities/coupon.entity';

export class UpdateCouponDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  code?: string;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minSubtotal?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startsAt?: Date | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiresAt?: Date | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
