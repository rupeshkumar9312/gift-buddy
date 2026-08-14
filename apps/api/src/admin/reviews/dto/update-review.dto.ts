import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
