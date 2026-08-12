import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class AdminReviewQueryDto {
  // Not @Type(() => Boolean) — that coerces via the Boolean() constructor,
  // where the *string* "false" is truthy (non-empty string), so ?isApproved=false
  // would silently resolve to true. Compare the raw query string instead.
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true',
  )
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
