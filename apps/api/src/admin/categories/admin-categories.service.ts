import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import { Product } from '../../products/entities/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export type AdminCategoryResponse = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  productCount: number;
};

type MysqlError = { code?: string };

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<AdminCategoryResponse[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.image', 'image')
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image?.url ?? null,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      productCount: (c as unknown as { productCount: number }).productCount,
    }));
  }

  async create(dto: CreateCategoryDto): Promise<AdminCategoryResponse> {
    let imageAssetId: number | null = null;
    if (dto.imageUrl) {
      const asset = await this.mediaAssetRepository.save(
        this.mediaAssetRepository.create({
          url: dto.imageUrl,
          provider: detectMediaProvider(dto.imageUrl),
        }),
      );
      imageAssetId = asset.id;
    }

    const category = this.categoryRepository.create({
      slug: dto.slug,
      name: dto.name,
      imageAssetId,
      parentId: dto.parentId ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.save(category);
    return {
      id: saved.id,
      slug: saved.slug,
      name: saved.name,
      image: dto.imageUrl ?? null,
      parentId: saved.parentId,
      sortOrder: saved.sortOrder,
      productCount: 0,
    };
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<AdminCategoryResponse> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.parentId !== undefined) category.parentId = dto.parentId;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.imageUrl !== undefined) {
      const asset = await this.mediaAssetRepository.save(
        this.mediaAssetRepository.create({
          url: dto.imageUrl,
          provider: detectMediaProvider(dto.imageUrl),
        }),
      );
      category.imageAssetId = asset.id;
    }

    await this.save(category);

    const withCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.image', 'image')
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .where('category.id = :id', { id })
      .getOne();
    const productCount = (withCount as unknown as { productCount: number })
      .productCount;

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      image: withCount?.image?.url ?? null,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      productCount,
    };
  }

  async remove(id: number): Promise<void> {
    const productCount = await this.productRepository.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete a category with ${productCount} product(s) — move or delete them first`,
      );
    }
    const result = await this.categoryRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }

  private async save(category: Category): Promise<Category> {
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A category with that slug already exists');
      }
      throw error;
    }
  }
}
