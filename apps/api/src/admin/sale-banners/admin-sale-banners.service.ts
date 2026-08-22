import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleBanner } from '../../sale-banners/entities/sale-banner.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { CreateSaleBannerDto } from './dto/create-sale-banner.dto';
import { UpdateSaleBannerDto } from './dto/update-sale-banner.dto';

@Injectable()
export class AdminSaleBannersService {
  constructor(
    @InjectRepository(SaleBanner)
    private readonly saleBannersRepository: Repository<SaleBanner>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  findAll(): Promise<SaleBanner[]> {
    return this.saleBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.id', 'ASC')
      .getMany();
  }

  async create(dto: CreateSaleBannerDto): Promise<SaleBanner> {
    const bannerImageAssetId = await this.resolveBannerImage(
      dto.bannerImageUrl,
    );
    const banner = await this.saleBannersRepository.save(
      this.saleBannersRepository.create({
        badge: dto.badge ?? null,
        heading: dto.heading,
        subtitle: dto.subtitle ?? null,
        note: dto.note ?? null,
        ctaLabel: dto.ctaLabel,
        ctaHref: dto.ctaHref,
        bannerImageAssetId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
    return this.findOneOrThrow(banner.id);
  }

  async update(id: number, dto: UpdateSaleBannerDto): Promise<SaleBanner> {
    await this.findOneOrThrow(id);

    const patch: Partial<SaleBanner> = {};
    if (dto.badge !== undefined) patch.badge = dto.badge || null;
    if (dto.heading !== undefined) patch.heading = dto.heading;
    if (dto.subtitle !== undefined) patch.subtitle = dto.subtitle || null;
    if (dto.note !== undefined) patch.note = dto.note || null;
    if (dto.ctaLabel !== undefined) patch.ctaLabel = dto.ctaLabel;
    if (dto.ctaHref !== undefined) patch.ctaHref = dto.ctaHref;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (dto.bannerImageUrl !== undefined) {
      patch.bannerImageAssetId = await this.resolveBannerImage(
        dto.bannerImageUrl,
      );
    }

    await this.saleBannersRepository.update(id, patch);
    return this.findOneOrThrow(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.saleBannersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Sale banner ${id} not found`);
    }
  }

  private async findOneOrThrow(id: number): Promise<SaleBanner> {
    const banner = await this.saleBannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.bannerImage', 'bannerImage')
      .where('banner.id = :id', { id })
      .getOne();
    if (!banner) {
      throw new NotFoundException(`Sale banner ${id} not found`);
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
