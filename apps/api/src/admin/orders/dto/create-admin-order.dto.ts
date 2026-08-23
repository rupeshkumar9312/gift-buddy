import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../../checkout/dto/address.dto';

class AdminOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateAdminOrderDto {
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemDto)
  items: AdminOrderItemDto[];

  @IsInt()
  shippingMethodId: number;

  // 'cod' behaves exactly like a customer's Cash on Delivery checkout
  // (pending_payment until cash is collected); 'paid' is for payment
  // already collected some other way (cash in hand, bank transfer, UPI)
  // before the order was entered — skips straight to paid.
  @IsIn(['cod', 'paid'])
  paymentMethod: 'cod' | 'paid';

  @IsString()
  @IsOptional()
  note?: string;
}
