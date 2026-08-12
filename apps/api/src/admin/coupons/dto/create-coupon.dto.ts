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

export class CreateCouponDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minSubtotal?: number = 0;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startsAt?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
