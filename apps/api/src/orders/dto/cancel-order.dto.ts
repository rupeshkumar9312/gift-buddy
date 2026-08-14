import { IsEmail, IsOptional } from 'class-validator';

// Logged-in users are identified by their JWT — email is only required for
// guest orders, mirroring how /orders/track proves ownership.
export class CancelOrderDto {
  @IsEmail()
  @IsOptional()
  email?: string;
}
