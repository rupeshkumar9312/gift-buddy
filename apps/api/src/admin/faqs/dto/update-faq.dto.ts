import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { FaqGroup } from '../../../content/entities/faq.entity';

export class UpdateFaqDto {
  @IsEnum(FaqGroup)
  @IsOptional()
  group?: FaqGroup;

  @IsString()
  @MinLength(1)
  @IsOptional()
  question?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  answer?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
