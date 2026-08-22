import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../checkout/dto/address.dto';

class OutOfAreaItemDto {
  @IsInt()
  productId: number;

  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  lineTotal: number;
}

export class CreateOutOfAreaOrderDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OutOfAreaItemDto)
  items: OutOfAreaItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;
}
