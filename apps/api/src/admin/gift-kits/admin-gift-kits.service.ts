import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftKit } from '../../gift-kits/entities/gift-kit.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { CreateGiftKitDto } from './dto/create-gift-kit.dto';
import { UpdateGiftKitDto } from './dto/update-gift-kit.dto';

@Injectable()
export class AdminGiftKitsService {
  constructor(
    @InjectRepository(GiftKit)
    private readonly giftKitsRepository: Repository<GiftKit>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  findAll(): Promise<GiftKit[]> {
    return this.giftKitsRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.bannerImage', 'bannerImage')
      .orderBy('kit.sortOrder', 'ASC')
      .addOrderBy('kit.id', 'ASC')
      .getMany();
  }

  async create(dto: CreateGiftKitDto): Promise<GiftKit> {
    const bannerImageAssetId = await this.resolveBannerImage(
      dto.bannerImageUrl,
    );
    const kit = await this.giftKitsRepository.save(
      this.giftKitsRepository.create({
        title: dto.title,
        subtitle: dto.subtitle ?? null,
        href: dto.href,
        bannerImageAssetId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
    return this.findOneOrThrow(kit.id);
  }

  async update(id: number, dto: UpdateGiftKitDto): Promise<GiftKit> {
    await this.findOneOrThrow(id);

    const patch: Partial<GiftKit> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.subtitle !== undefined) patch.subtitle = dto.subtitle || null;
    if (dto.href !== undefined) patch.href = dto.href;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (dto.bannerImageUrl !== undefined) {
      patch.bannerImageAssetId = await this.resolveBannerImage(
        dto.bannerImageUrl,
      );
    }

    await this.giftKitsRepository.update(id, patch);
    return this.findOneOrThrow(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.giftKitsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Gift kit ${id} not found`);
    }
  }

  private async findOneOrThrow(id: number): Promise<GiftKit> {
    const kit = await this.giftKitsRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.bannerImage', 'bannerImage')
      .where('kit.id = :id', { id })
      .getOne();
    if (!kit) {
      throw new NotFoundException(`Gift kit ${id} not found`);
    }
    return kit;
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
