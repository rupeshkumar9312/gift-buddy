import { Controller, Get } from '@nestjs/common';
import { GiftKitsService } from './gift-kits.service';

@Controller('gift-kits')
export class GiftKitsController {
  constructor(private readonly giftKitsService: GiftKitsService) {}

  @Get()
  findAll() {
    return this.giftKitsService.findActive();
  }
}
