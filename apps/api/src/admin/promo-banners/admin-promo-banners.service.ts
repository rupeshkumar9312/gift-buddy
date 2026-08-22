import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoBanner } from '../../promo-banners/entities/promo-banner.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { CreatePromoBannerDto } from './dto/create-promo-banner.dto';
import { UpdatePromoBannerDto } from './dto/update-promo-banner.dto';

@Injectable()
export class AdminPromoBannersService {
  constructor(
    @InjectRepository(PromoBanner)
    private readonly promoBannersRepository: Repository<PromoBanner>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  findAll(): Promise<PromoBanner[]> {
    return this.promoBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.id', 'ASC')
      .getMany();
  }

  async create(dto: CreatePromoBannerDto): Promise<PromoBanner> {
    const bannerImageAssetId = await this.resolveBannerImage(
      dto.bannerImageUrl,
    );
    const banner = await this.promoBannersRepository.save(
      this.promoBannersRepository.create({
        eyebrow: dto.eyebrow ?? null,
        heading: dto.heading,
        subtitle: dto.subtitle ?? null,
        ctaLabel: dto.ctaLabel,
        ctaHref: dto.ctaHref,
        bannerImageAssetId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
    return this.findOneOrThrow(banner.id);
  }

  async update(id: number, dto: UpdatePromoBannerDto): Promise<PromoBanner> {
    await this.findOneOrThrow(id);

    const patch: Partial<PromoBanner> = {};
    if (dto.eyebrow !== undefined) patch.eyebrow = dto.eyebrow || null;
    if (dto.heading !== undefined) patch.heading = dto.heading;
    if (dto.subtitle !== undefined) patch.subtitle = dto.subtitle || null;
    if (dto.ctaLabel !== undefined) patch.ctaLabel = dto.ctaLabel;
    if (dto.ctaHref !== undefined) patch.ctaHref = dto.ctaHref;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (dto.bannerImageUrl !== undefined) {
      patch.bannerImageAssetId = await this.resolveBannerImage(
        dto.bannerImageUrl,
      );
    }

    await this.promoBannersRepository.update(id, patch);
    return this.findOneOrThrow(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.promoBannersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Promo banner ${id} not found`);
    }
  }

  private async findOneOrThrow(id: number): Promise<PromoBanner> {
    const banner = await this.promoBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .where('banner.id = :id', { id })
      .getOne();
    if (!banner) {
      throw new NotFoundException(`Promo banner ${id} not found`);
    }
    return banner;
  }

  private async resolveBannerImage(url?: string): Promise<number | null> {
    if (!url) return null;
    const asset = await this.mediaAssetRepository.save(
      this.mediaAssetRepository.create({
        url,
        provider: detectMediaProvider(url),
      }),
    );
    return asset.id;
  }
}
