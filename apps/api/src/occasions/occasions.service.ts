import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  ProductResponse,
  toProductResponse,
} from '../products/products.mapper';
import { Occasion } from './entities/occasion.entity';

export type OccasionSummary = {
  slug: string;
  name: string;
  tagline: string | null;
  bannerImage: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

export type OccasionProductResponse = ProductResponse & {
  // Which of this occasion's own categories (a per-occasion tag, distinct
  // from the product's real `category`) this product is tagged with.
  occasionCategorySlugs: string[];
};

export type OccasionDetail = OccasionSummary & {
  description: string | null;
  categories: { slug: string; name: string }[];
  products: OccasionProductResponse[];
};

function isCurrentlyActive(occasion: Occasion): boolean {
  if (!occasion.isActive) return false;
  const now = new Date();
  if (occasion.startsAt && now < occasion.startsAt) return false;
  if (occasion.endsAt && now > occasion.endsAt) return false;
  return true;
}

function toSummary(occasion: Occasion): OccasionSummary {
  return {
    slug: occasion.slug,
    name: occasion.name,
    tagline: occasion.tagline,
    bannerImage: occasion.bannerImage?.url ?? null,
    startsAt: occasion.startsAt ? occasion.startsAt.toISOString() : null,
    endsAt: occasion.endsAt ? occasion.endsAt.toISOString() : null,
  };
}

@Injectable()
export class OccasionsService {
  constructor(
    @InjectRepository(Occasion)
    private readonly occasionsRepository: Repository<Occasion>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<OccasionSummary[]> {
    const occasions = await this.occasionsRepository
      .createQueryBuilder('occasion')
      .leftJoinAndSelect('occasion.bannerImage', 'bannerImage')
      .orderBy('occasion.sortOrder', 'ASC')
      .addOrderBy('occasion.name', 'ASC')
      .getMany();

    return occasions.filter(isCurrentlyActive).map(toSummary);
  }

  // Resolved product list = union of directly-linked products and active
  // products in any linked category — this is what lets an occasion say
  // "these specific gifts, plus all of Jewelry & Accessories".
  async findBySlug(slug: string): Promise<OccasionDetail> {
    const occasion = await this.occasionsRepository
      .createQueryBuilder('occasion')
      .leftJoinAndSelect('occasion.bannerImage', 'bannerImage')
      .leftJoinAndSelect('occasion.categories', 'categories')
      .leftJoinAndSelect('occasion.products', 'directProducts')
      .leftJoinAndSelect('occasion.occasionCategories', 'occasionCategories')
      .leftJoinAndSelect(
        'occasionCategories.products',
        'occasionCategoryProducts',
      )
      .where('occasion.slug = :slug', { slug })
      .getOne();

    if (!occasion || !isCurrentlyActive(occasion)) {
      throw new NotFoundException(`Occasion "${slug}" not found`);
    }

    const categoryIds = occasion.categories.map((c) => c.id);
    const directProductIds = occasion.products.map((p) => p.id);

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('images.asset', 'asset')
      .where('product.isActive = :isActive', { isActive: true });

    if (categoryIds.length > 0 && directProductIds.length > 0) {
      qb.andWhere(
        '(category.id IN (:...categoryIds) OR product.id IN (:...directProductIds))',
        { categoryIds, directProductIds },
      );
    } else if (categoryIds.length > 0) {
      qb.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    } else if (directProductIds.length > 0) {
      qb.andWhere('product.id IN (:...directProductIds)', {
        directProductIds,
      });
    } else {
      qb.andWhere('1 = 0');
    }

    const products = await qb
      .orderBy('product.isFeatured', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .getMany();

    // Map productId -> the occasion-only category slugs it's tagged with,
    // intersected against the resolved product list above (defensive: a
    // product could theoretically fall out of the resolved set — e.g. it
    // was deactivated — between when it was tagged and now).
    const resolvedProductIds = new Set(products.map((p) => p.id));
    const tagsByProductId = new Map<number, string[]>();
    for (const occasionCategory of occasion.occasionCategories) {
      for (const product of occasionCategory.products) {
        if (!resolvedProductIds.has(product.id)) continue;
        const slugs = tagsByProductId.get(product.id) ?? [];
        slugs.push(occasionCategory.slug);
        tagsByProductId.set(product.id, slugs);
      }
    }

    return {
      ...toSummary(occasion),
      description: occasion.description,
      categories: [
        ...occasion.categories.map((c) => ({ slug: c.slug, name: c.name })),
        ...occasion.occasionCategories.map((oc) => ({
          slug: oc.slug,
          name: oc.name,
        })),
      ],
      products: products.map((product) => ({
        ...toProductResponse(product),
        occasionCategorySlugs: tagsByProductId.get(product.id) ?? [],
      })),
    };
  }
}
