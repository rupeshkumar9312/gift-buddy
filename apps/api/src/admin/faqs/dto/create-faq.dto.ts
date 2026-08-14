import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { FaqGroup } from '../../../content/entities/faq.entity';

export class CreateFaqDto {
  @IsEnum(FaqGroup)
  group: FaqGroup;

  @IsString()
  @MinLength(1)
  question: string;

  @IsString()
  @MinLength(1)
  answer: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number = 0;
}
