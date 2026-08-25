import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReturnRequestStatus } from '../../../returns/entities/return-request.entity';

export const ADMIN_RESOLVABLE_STATUSES = [
  ReturnRequestStatus.APPROVED,
  ReturnRequestStatus.REJECTED,
] as const;

export class UpdateReturnRequestDto {
  @IsIn(ADMIN_RESOLVABLE_STATUSES)
  status: ReturnRequestStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  adminNote?: string;
}
