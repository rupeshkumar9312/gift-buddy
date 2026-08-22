import { Controller, Get } from '@nestjs/common';
import { SocietiesService } from './societies.service';

@Controller('societies')
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Get()
  findAll() {
    return this.societiesService.findActive();
  }
}
