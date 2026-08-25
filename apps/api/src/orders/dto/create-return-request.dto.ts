import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

// Logged-in users are identified by their JWT — email is only required for
// guest orders, mirroring CancelOrderDto/orders/track.
export class CreateReturnRequestDto {
  @IsString()
  @MinLength(1)
  reason: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsEmail()
  @IsOptional()
  email?: string;
}
