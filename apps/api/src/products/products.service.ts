import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { Product } from './entities/product.entity';
import { ProductQueryDto, ProductSort } from './dto/product-query.dto';
import { ProductResponse, toProductResponse } from './products.mapper';

const EFFECTIVE_PRICE = 'COALESCE(product.salePrice, product.price)';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private baseQuery() {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('images.asset', 'asset')
      .where('product.isActive = :isActive', { isActive: true });
  }

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.baseQuery();

    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }
    if (query.minRating) {
      qb.andWhere('product.ratingAvg >= :minRating', {
        minRating: query.minRating,
      });
    }
    if (query.maxPrice) {
      qb.andWhere(`${EFFECTIVE_PRICE} <= :maxPrice`, {
        maxPrice: query.maxPrice,
      });
    }
    if (query.search) {
      qb.andWhere('product.name LIKE :search', { search: `%${query.search}%` });
    }

    switch (query.sort) {
      case ProductSort.PRICE_ASC:
        qb.addSelect(EFFECTIVE_PRICE, 'effective_price').orderBy(
          'effective_price',
          'ASC',
        );
        break;
      case ProductSort.PRICE_DESC:
        qb.addSelect(EFFECTIVE_PRICE, 'effective_price').orderBy(
          'effective_price',
          'DESC',
        );
        break;
      case ProductSort.NAME:
        qb.orderBy('product.name', 'ASC');
        break;
      case ProductSort.FEATURED:
      default:
        qb.orderBy('product.isFeatured', 'DESC').addOrderBy(
          'product.createdAt',
          'DESC',
        );
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [products, total] = await qb.getManyAndCount();

    return new PaginatedResponse(
      products.map(toProductResponse),
      total,
      page,
      limit,
    );
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.baseQuery()
      .andWhere('product.slug = :slug', { slug })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    return toProductResponse(product);
  }

  async findRelated(slug: string, limit = 4): Promise<ProductResponse[]> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    const sameCategory = await this.baseQuery()
      .andWhere('category.id = :categoryId', { categoryId: product.categoryId })
      .andWhere('product.slug != :slug', { slug })
      .orderBy('product.ratingAvg', 'DESC')
      .take(limit)
      .getMany();

    if (sameCategory.length >= limit) {
      return sameCategory.map(toProductResponse);
    }

    const fillers = await this.baseQuery()
      .andWhere('product.slug != :slug', { slug })
      .andWhere('product.id NOT IN (:...ids)', {
        ids: [...sameCategory.map((p) => p.id), 0],
      })
      .orderBy('product.ratingAvg', 'DESC')
      .take(limit - sameCategory.length)
      .getMany();

    return [...sameCategory, ...fillers].map(toProductResponse);
  }

  async findFeatured(limit = 8): Promise<ProductResponse[]> {
    const featured = await this.baseQuery()
      .andWhere('product.isFeatured = :isFeatured', { isFeatured: true })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getMany();

    if (featured.length >= limit) {
      return featured.map(toProductResponse);
    }

    const fillers = await this.baseQuery()
      .andWhere('product.id NOT IN (:...ids)', {
        ids: [...featured.map((p) => p.id), 0],
      })
      .orderBy('product.ratingAvg', 'DESC')
      .take(limit - featured.length)
      .getMany();

    return [...featured, ...fillers].map(toProductResponse);
  }
}
