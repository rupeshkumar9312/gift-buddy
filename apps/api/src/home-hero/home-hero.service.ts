import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeHero } from './entities/home-hero.entity';

export type HomeHeroResponse = {
  eyebrow: string | null;
  heading: string;
  description: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  bannerImage: string | null;
};

export function toHomeHeroResponse(hero: HomeHero): HomeHeroResponse {
  return {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    description: hero.description,
    primaryCtaLabel: hero.primaryCtaLabel,
    primaryCtaHref: hero.primaryCtaHref,
    secondaryCtaLabel: hero.secondaryCtaLabel,
    secondaryCtaHref: hero.secondaryCtaHref,
    bannerImage: hero.bannerImage?.url ?? null,
  };
}

@Injectable()
export class HomeHeroService {
  constructor(
    @InjectRepository(HomeHero)
    private readonly homeHeroRepository: Repository<HomeHero>,
  ) {}

  async get(): Promise<HomeHeroResponse> {
    const hero = await this.homeHeroRepository
      .createQueryBuilder('hero')
      .leftJoinAndSelect('hero.bannerImage', 'bannerImage')
      .where('hero.id = :id', { id: 1 })
      .getOne();
    if (!hero) {
      throw new NotFoundException(
        'Home hero row missing — check the AddHomeHero migration ran',
      );
    }
    return toHomeHeroResponse(hero);
  }
}
