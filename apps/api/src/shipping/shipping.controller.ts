import { Controller, Get } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping-methods')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  findAll() {
    return this.shippingService.findActive();
  }
}
