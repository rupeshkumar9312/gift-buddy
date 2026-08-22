import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoBanner } from './entities/promo-banner.entity';

export type PromoBannerResponse = {
  id: number;
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
};

export function toPromoBannerResponse(
  banner: PromoBanner,
): PromoBannerResponse {
  return {
    id: banner.id,
    eyebrow: banner.eyebrow,
    heading: banner.heading,
    subtitle: banner.subtitle,
    ctaLabel: banner.ctaLabel,
    ctaHref: banner.ctaHref,
    image: banner.bannerImage?.url ?? null,
  };
}

@Injectable()
export class PromoBannersService {
  constructor(
    @InjectRepository(PromoBanner)
    private readonly promoBannersRepository: Repository<PromoBanner>,
  ) {}

  async findActive(): Promise<PromoBannerResponse[]> {
    const banners = await this.promoBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .where('banner.isActive = :isActive', { isActive: true })
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.id', 'ASC')
      .getMany();
    return banners.map(toPromoBannerResponse);
  }
}
