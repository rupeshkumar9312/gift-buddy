import { Body, Controller, Post } from '@nestjs/common';
import { OutOfAreaOrdersService } from './out-of-area-orders.service';
import { CreateOutOfAreaOrderDto } from './dto/create-out-of-area-order.dto';

@Controller('out-of-area-orders')
export class OutOfAreaOrdersController {
  constructor(
    private readonly outOfAreaOrdersService: OutOfAreaOrdersService,
  ) {}

  @Post()
  create(@Body() dto: CreateOutOfAreaOrderDto) {
    return this.outOfAreaOrdersService.create(dto);
  }
}
