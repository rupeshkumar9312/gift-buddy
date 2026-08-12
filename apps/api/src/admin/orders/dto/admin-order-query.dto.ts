import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '../../../orders/entities/order.entity';

export class AdminOrderQueryDto {
  @IsOptional()
  @IsIn(Object.values(OrderStatus))
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
