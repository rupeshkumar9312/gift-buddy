import { Controller, Get } from '@nestjs/common';
import { SaleBannersService } from './sale-banners.service';

@Controller('sale-banners')
export class SaleBannersController {
  constructor(private readonly saleBannersService: SaleBannersService) {}

  @Get()
  findAll() {
    return this.saleBannersService.findActive();
  }
}
