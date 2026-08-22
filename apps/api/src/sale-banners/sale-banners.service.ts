import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleBanner } from './entities/sale-banner.entity';

export type SaleBannerResponse = {
  id: number;
  badge: string | null;
  heading: string;
  subtitle: string | null;
  note: string | null;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
};

export function toSaleBannerResponse(banner: SaleBanner): SaleBannerResponse {
  return {
    id: banner.id,
    badge: banner.badge,
    heading: banner.heading,
    subtitle: banner.subtitle,
    note: banner.note,
    ctaLabel: banner.ctaLabel,
    ctaHref: banner.ctaHref,
    image: banner.bannerImage?.url ?? null,
  };
}

@Injectable()
export class SaleBannersService {
  constructor(
    @InjectRepository(SaleBanner)
    private readonly saleBannersRepository: Repository<SaleBanner>,
  ) {}

  async findActive(): Promise<SaleBannerResponse[]> {
    const banners = await this.saleBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .where('banner.isActive = :isActive', { isActive: true })
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.id', 'ASC')
      .getMany();
    return banners.map(toSaleBannerResponse);
  }
}
