import { Controller, Get } from '@nestjs/common';
import { HomeHeroService } from './home-hero.service';

@Controller('home-hero')
export class HomeHeroController {
  constructor(private readonly homeHeroService: HomeHeroService) {}

  @Get()
  get() {
    return this.homeHeroService.get();
  }
}
