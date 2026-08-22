import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftKit } from './entities/gift-kit.entity';

export type GiftKitResponse = {
  id: number;
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
};

export function toGiftKitResponse(kit: GiftKit): GiftKitResponse {
  return {
    id: kit.id,
    title: kit.title,
    subtitle: kit.subtitle,
    href: kit.href,
    image: kit.bannerImage?.url ?? null,
  };
}

@Injectable()
export class GiftKitsService {
  constructor(
    @InjectRepository(GiftKit)
    private readonly giftKitsRepository: Repository<GiftKit>,
  ) {}

  async findActive(): Promise<GiftKitResponse[]> {
    const kits = await this.giftKitsRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.bannerImage', 'bannerImage')
      .where('kit.isActive = :isActive', { isActive: true })
      .orderBy('kit.sortOrder', 'ASC')
      .addOrderBy('kit.id', 'ASC')
      .getMany();
    return kits.map(toGiftKitResponse);
  }
}
