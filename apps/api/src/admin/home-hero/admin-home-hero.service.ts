import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeHero } from '../../home-hero/entities/home-hero.entity';
import {
  HomeHeroResponse,
  toHomeHeroResponse,
} from '../../home-hero/home-hero.service';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { UpdateHomeHeroDto } from './dto/update-home-hero.dto';

@Injectable()
export class AdminHomeHeroService {
  constructor(
    @InjectRepository(HomeHero)
    private readonly homeHeroRepository: Repository<HomeHero>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  async get(): Promise<HomeHeroResponse> {
    return toHomeHeroResponse(await this.findOrThrow());
  }

  async update(dto: UpdateHomeHeroDto): Promise<HomeHeroResponse> {
    await this.findOrThrow(); // 404s before writing anything if the row is somehow missing

    // A plain `update()` against columns only — not `save()` on a loaded
    // entity. `findOrThrow` eager-loads the `bannerImage` *relation*
    // alongside the `bannerImageAssetId` *column* (same underlying DB
    // column, two entity properties); mutating only the column and then
    // `save()`-ing the entity lets TypeORM re-derive the FK from the still
    // -stale relation object, silently discarding the new asset id. Doing
    // this exact fix as a direct `update()` never touches the relation, so
    // there's nothing stale to lose the write to.
    const patch: Partial<HomeHero> = {};
    if (dto.eyebrow !== undefined) patch.eyebrow = dto.eyebrow || null;
    if (dto.heading !== undefined) patch.heading = dto.heading;
    if (dto.description !== undefined)
      patch.description = dto.description || null;
    if (dto.primaryCtaLabel !== undefined) {
      patch.primaryCtaLabel = dto.primaryCtaLabel || null;
    }
    if (dto.primaryCtaHref !== undefined) {
      patch.primaryCtaHref = dto.primaryCtaHref || null;
    }
    if (dto.secondaryCtaLabel !== undefined) {
      patch.secondaryCtaLabel = dto.secondaryCtaLabel || null;
    }
    if (dto.secondaryCtaHref !== undefined) {
      patch.secondaryCtaHref = dto.secondaryCtaHref || null;
    }
    if (dto.bannerImageUrl !== undefined) {
      patch.bannerImageAssetId = await this.resolveBannerImage(
        dto.bannerImageUrl,
      );
    }

    await this.homeHeroRepository.update(1, patch);
    return this.get();
  }

  private async findOrThrow(): Promise<HomeHero> {
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
    return hero;
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
