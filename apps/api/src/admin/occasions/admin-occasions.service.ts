import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { Product } from '../../products/entities/product.entity';
import { Occasion } from '../../occasions/entities/occasion.entity';
import { OccasionCategory } from '../../occasions/entities/occasion-category.entity';
import { CreateOccasionDto } from './dto/create-occasion.dto';
import { UpdateOccasionDto } from './dto/update-occasion.dto';
import { CreateOccasionCategoryDto } from './dto/create-occasion-category.dto';
import { UpdateOccasionCategoryDto } from './dto/update-occasion-category.dto';

export type AdminOccasionResponse = {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  bannerImage: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryIds: number[];
  categories: { id: number; slug: string; name: string }[];
  productIds: number[];
  products: { id: number; slug: string; name: string }[];
  occasionCategories: {
    id: number;
    name: string;
    slug: string;
    sortOrder: number;
    productIds: number[];
  }[];
};

type MysqlError = { code?: string };

@Injectable()
export class AdminOccasionsService {
  constructor(
    @InjectRepository(Occasion)
    private readonly occasionsRepository: Repository<Occasion>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    @InjectRepository(OccasionCategory)
    private readonly occasionCategoryRepository: Repository<OccasionCategory>,
  ) {}

  async findAll(): Promise<AdminOccasionResponse[]> {
    const occasions = await this.occasionsRepository
      .createQueryBuilder('occasion')
      .leftJoinAndSelect('occasion.bannerImage', 'bannerImage')
      .leftJoinAndSelect('occasion.categories', 'categories')
      .leftJoinAndSelect('occasion.products', 'products')
      .leftJoinAndSelect('occasion.occasionCategories', 'occasionCategories')
      .leftJoinAndSelect(
        'occasionCategories.products',
        'occasionCategoryProducts',
      )
      .orderBy('occasion.sortOrder', 'ASC')
      .addOrderBy('occasion.name', 'ASC')
      .getMany();

    return occasions.map((occasion) => this.toResponse(occasion));
  }

  async findOne(id: number): Promise<AdminOccasionResponse> {
    const occasion = await this.findOccasionOrThrow(id);
    return this.toResponse(occasion);
  }

  async create(dto: CreateOccasionDto): Promise<AdminOccasionResponse> {
    const bannerImageAssetId = await this.resolveBannerImage(
      dto.bannerImageUrl,
    );
    const [categories, products] = await Promise.all([
      this.resolveCategories(dto.categoryIds),
      this.resolveProducts(dto.productIds),
    ]);

    const occasion = this.occasionsRepository.create({
      slug: dto.slug,
      name: dto.name,
      tagline: dto.tagline ?? null,
      description: dto.description ?? null,
      bannerImageAssetId,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      categories,
      products,
    });

    const saved = await this.save(occasion);
    return this.findOne(saved.id);
  }

  async update(
    id: number,
    dto: UpdateOccasionDto,
  ): Promise<AdminOccasionResponse> {
    const occasion = await this.findOccasionOrThrow(id);

    if (dto.slug !== undefined) occasion.slug = dto.slug;
    if (dto.name !== undefined) occasion.name = dto.name;
    if (dto.tagline !== undefined) occasion.tagline = dto.tagline;
    if (dto.description !== undefined) occasion.description = dto.description;
    if (dto.startsAt !== undefined) {
      occasion.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      occasion.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.isActive !== undefined) occasion.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) occasion.sortOrder = dto.sortOrder;
    if (dto.bannerImageUrl !== undefined) {
      occasion.bannerImageAssetId = await this.resolveBannerImage(
        dto.bannerImageUrl,
      );
    }
    if (dto.categoryIds !== undefined) {
      occasion.categories = await this.resolveCategories(dto.categoryIds);
    }
    if (dto.productIds !== undefined) {
      occasion.products = await this.resolveProducts(dto.productIds);
    }

    await this.save(occasion);

    // Unlinking a category/product from the occasion can leave an
    // occasion-only category tagging a product that's no longer part of
    // this occasion's own resolved gift list — prune those stale links.
    if (dto.categoryIds !== undefined || dto.productIds !== undefined) {
      await this.pruneStaleOccasionCategoryLinks(occasion);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.occasionsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Occasion ${id} not found`);
    }
  }

  // ---- Occasion-only categories ----
  // A separate tagging layer, scoped to this occasion, that can only be
  // applied to products already in this occasion's own resolved product
  // set (its directly-linked products + products in its linked
  // categories) — never the whole catalog.

  async createOccasionCategory(
    occasionId: number,
    dto: CreateOccasionCategoryDto,
  ): Promise<AdminOccasionResponse> {
    const occasion = await this.findOccasionOrThrow(occasionId);
    const products = await this.resolveOccasionScopedProducts(
      occasion,
      dto.productIds,
    );

    const occasionCategory = this.occasionCategoryRepository.create({
      occasionId,
      name: dto.name,
      slug: dto.slug,
      sortOrder: dto.sortOrder ?? 0,
      products,
    });
    await this.saveOccasionCategory(occasionCategory);
    return this.findOne(occasionId);
  }

  async updateOccasionCategory(
    occasionId: number,
    categoryId: number,
    dto: UpdateOccasionCategoryDto,
  ): Promise<AdminOccasionResponse> {
    const occasion = await this.findOccasionOrThrow(occasionId);
    const occasionCategory = await this.findOccasionCategoryOrThrow(
      occasionId,
      categoryId,
    );

    if (dto.name !== undefined) occasionCategory.name = dto.name;
    if (dto.slug !== undefined) occasionCategory.slug = dto.slug;
    if (dto.sortOrder !== undefined) occasionCategory.sortOrder = dto.sortOrder;
    if (dto.productIds !== undefined) {
      occasionCategory.products = await this.resolveOccasionScopedProducts(
        occasion,
        dto.productIds,
      );
    }

    await this.saveOccasionCategory(occasionCategory);
    return this.findOne(occasionId);
  }

  async removeOccasionCategory(
    occasionId: number,
    categoryId: number,
  ): Promise<AdminOccasionResponse> {
    await this.findOccasionCategoryOrThrow(occasionId, categoryId);
    await this.occasionCategoryRepository.delete(categoryId);
    return this.findOne(occasionId);
  }

  private async findOccasionCategoryOrThrow(
    occasionId: number,
    categoryId: number,
  ): Promise<OccasionCategory> {
    const occasionCategory = await this.occasionCategoryRepository.findOne({
      where: { id: categoryId, occasionId },
    });
    if (!occasionCategory) {
      throw new NotFoundException(
        `Occasion-only category ${categoryId} not found on occasion ${occasionId}`,
      );
    }
    return occasionCategory;
  }

  // The same union-of-direct-products + linked-categories resolution the
  // public OccasionsService uses for the occasion's own page — kept as a
  // separate query here, matching this codebase's existing convention of
  // public/admin services each owning their own queries rather than
  // sharing one (see CategoriesService vs AdminCategoriesService).
  private async resolveOccasionProductIds(
    occasion: Occasion,
  ): Promise<number[]> {
    const categoryIds = occasion.categories.map((c) => c.id);
    const directProductIds = occasion.products.map((p) => p.id);
    if (categoryIds.length === 0 && directProductIds.length === 0) return [];

    const qb = this.productRepository
      .createQueryBuilder('product')
      .select('product.id')
      .where('product.isActive = :isActive', { isActive: true });

    if (categoryIds.length > 0 && directProductIds.length > 0) {
      qb.andWhere(
        '(product.categoryId IN (:...categoryIds) OR product.id IN (:...directProductIds))',
        {
          categoryIds,
          directProductIds,
        },
      );
    } else if (categoryIds.length > 0) {
      qb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
    } else {
      qb.andWhere('product.id IN (:...directProductIds)', { directProductIds });
    }

    const rows = await qb.getMany();
    return rows.map((p) => p.id);
  }

  private async resolveOccasionScopedProducts(
    occasion: Occasion,
    productIds?: number[],
  ): Promise<Product[]> {
    if (!productIds || productIds.length === 0) return [];
    const allowedIds = await this.resolveOccasionProductIds(occasion);
    const disallowed = productIds.filter((id) => !allowedIds.includes(id));
    if (disallowed.length > 0) {
      throw new BadRequestException(
        `Product(s) ${disallowed.join(', ')} aren't part of this occasion's own gifts or linked categories`,
      );
    }
    return this.productRepository.findBy({ id: In(productIds) });
  }

  private async pruneStaleOccasionCategoryLinks(
    occasion: Occasion,
  ): Promise<void> {
    const allowedIds = new Set(await this.resolveOccasionProductIds(occasion));
    const occasionCategories = await this.occasionCategoryRepository.find({
      where: { occasionId: occasion.id },
      relations: ['products'],
    });
    for (const occasionCategory of occasionCategories) {
      const stillValid = occasionCategory.products.filter((p) =>
        allowedIds.has(p.id),
      );
      if (stillValid.length !== occasionCategory.products.length) {
        occasionCategory.products = stillValid;
        await this.occasionCategoryRepository.save(occasionCategory);
      }
    }
  }

  private async resolveCategories(categoryIds?: number[]): Promise<Category[]> {
    if (!categoryIds || categoryIds.length === 0) return [];
    return this.categoryRepository.findBy({ id: In(categoryIds) });
  }

  private async resolveProducts(productIds?: number[]): Promise<Product[]> {
    if (!productIds || productIds.length === 0) return [];
    return this.productRepository.findBy({ id: In(productIds) });
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

  private toResponse(occasion: Occasion): AdminOccasionResponse {
    return {
      id: occasion.id,
      slug: occasion.slug,
      name: occasion.name,
      tagline: occasion.tagline,
      description: occasion.description,
      bannerImage: occasion.bannerImage?.url ?? null,
      startsAt: occasion.startsAt ? occasion.startsAt.toISOString() : null,
      endsAt: occasion.endsAt ? occasion.endsAt.toISOString() : null,
      isActive: occasion.isActive,
      sortOrder: occasion.sortOrder,
      categoryIds: occasion.categories.map((c) => c.id),
      categories: occasion.categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      })),
      productIds: occasion.products.map((p) => p.id),
      products: occasion.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
      })),
      occasionCategories: (occasion.occasionCategories ?? []).map((oc) => ({
        id: oc.id,
        name: oc.name,
        slug: oc.slug,
        sortOrder: oc.sortOrder,
        productIds: (oc.products ?? []).map((p) => p.id),
      })),
    };
  }

  private async findOccasionOrThrow(id: number): Promise<Occasion> {
    const occasion = await this.occasionsRepository
      .createQueryBuilder('occasion')
      .leftJoinAndSelect('occasion.bannerImage', 'bannerImage')
      .leftJoinAndSelect('occasion.categories', 'categories')
      .leftJoinAndSelect('occasion.products', 'products')
      .leftJoinAndSelect('occasion.occasionCategories', 'occasionCategories')
      .leftJoinAndSelect(
        'occasionCategories.products',
        'occasionCategoryProducts',
      )
      .where('occasion.id = :id', { id })
      .getOne();
    if (!occasion) {
      throw new NotFoundException(`Occasion ${id} not found`);
    }
    return occasion;
  }

  private async save(occasion: Occasion): Promise<Occasion> {
    try {
      return await this.occasionsRepository.save(occasion);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'An occasion with that slug already exists',
        );
      }
      throw error;
    }
  }

  private async saveOccasionCategory(
    occasionCategory: OccasionCategory,
  ): Promise<OccasionCategory> {
    try {
      return await this.occasionCategoryRepository.save(occasionCategory);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'This occasion already has a category with that slug',
        );
      }
      throw error;
    }
  }
}
