import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

export type CategoryResponse = {
  slug: string;
  name: string;
  image: string | null;
  count: number;
};

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.image', 'image')
      .loadRelationCountAndMap(
        'category.count',
        'category.products',
        'product',
        (qb) => qb.andWhere('product.isActive = :isActive', { isActive: true }),
      )
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();

    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      image: category.image?.url ?? null,
      count: (category as unknown as { count: number }).count,
    }));
  }
}
