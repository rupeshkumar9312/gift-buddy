import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';

export class CheckoutDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billingAddress?: AddressDto;

  @IsInt()
  @Min(1)
  shippingMethodId: number;
}
