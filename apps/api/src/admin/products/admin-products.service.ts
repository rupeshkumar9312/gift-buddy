import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Product } from '../../products/entities/product.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  AdminProductDetail,
  AdminProductSummary,
  toAdminProductDetail,
  toAdminProductSummary,
} from './admin-products.mapper';

type MysqlError = { code?: string; sqlMessage?: string };

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  private baseQuery() {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('images.asset', 'asset');
  }

  async findAll(
    query: AdminProductQueryDto,
  ): Promise<PaginatedResponse<AdminProductSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.baseQuery();
    if (!query.includeInactive) {
      qb.andWhere('product.isActive = :isActive', { isActive: true });
    }
    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.search) {
      qb.andWhere('(product.name LIKE :search OR product.sku LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, total] = await qb.getManyAndCount();
    return new PaginatedResponse(
      products.map(toAdminProductSummary),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number): Promise<AdminProductDetail> {
    const product = await this.baseQuery()
      .andWhere('product.id = :id', { id })
      .getOne();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return toAdminProductDetail(product);
  }

  async create(dto: CreateProductDto): Promise<AdminProductDetail> {
    const product = this.productRepository.create({
      slug: dto.slug,
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      price: dto.price.toFixed(2),
      salePrice: dto.salePrice ? dto.salePrice.toFixed(2) : null,
      categoryId: dto.categoryId,
      stockQty: dto.stockQty,
      isFeatured: dto.isFeatured ?? false,
      isActive: dto.isActive ?? true,
      returnDays: dto.returnDays ?? 30,
    });

    const saved = await this.save(product);
    await this.replaceImages(saved.id, dto.images);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductDto): Promise<AdminProductDetail> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    if (dto.slug !== undefined) product.slug = dto.slug;
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.salePrice !== undefined) {
      product.salePrice = dto.salePrice ? dto.salePrice.toFixed(2) : null;
    }
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId;
    if (dto.stockQty !== undefined) product.stockQty = dto.stockQty;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.returnDays !== undefined) product.returnDays = dto.returnDays;

    await this.save(product);
    if (dto.images) {
      await this.replaceImages(id, dto.images);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  private async save(product: Product): Promise<Product> {
    try {
      return await this.productRepository.save(product);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'A product with that slug or SKU already exists',
        );
      }
      throw error;
    }
  }

  private async replaceImages(
    productId: number,
    images: { url: string; altText?: string }[],
  ): Promise<void> {
    await this.productImageRepository.delete({ productId });
    for (const [index, image] of images.entries()) {
      const asset = await this.mediaAssetRepository.save(
        this.mediaAssetRepository.create({
          url: image.url,
          provider: detectMediaProvider(image.url),
          altText: image.altText ?? null,
        }),
      );
      await this.productImageRepository.save(
        this.productImageRepository.create({
          productId,
          assetId: asset.id,
          sortOrder: index,
          isPrimary: index === 0,
        }),
      );
    }
  }
}
