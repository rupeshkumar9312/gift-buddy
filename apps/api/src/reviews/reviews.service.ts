import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { Product } from '../products/entities/product.entity';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  FeaturedReviewResponse,
  ReviewResponse,
  toFeaturedReviewResponse,
  toReviewResponse,
} from './reviews.mapper';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findApprovedForProduct(
    slug: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<ReviewResponse>> {
    const product = await this.productsRepository.findOne({ where: { slug } });
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: { productId: product.id, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponse(
      reviews.map(toReviewResponse),
      total,
      page,
      limit,
    );
  }

  async findFeatured(limit = 6): Promise<FeaturedReviewResponse[]> {
    const reviews = await this.reviewsRepository.find({
      where: { isApproved: true, isFeatured: true },
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return reviews.map(toFeaturedReviewResponse);
  }

  async create(
    slug: string,
    userId: number,
    dto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    const product = await this.productsRepository.findOne({ where: { slug } });
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    const existing = await this.reviewsRepository.findOne({
      where: { productId: product.id, userId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    try {
      const review = await this.reviewsRepository.save(
        this.reviewsRepository.create({
          productId: product.id,
          userId,
          rating: dto.rating,
          title: dto.title,
          body: dto.body,
        }),
      );
      const saved = await this.reviewsRepository.findOneOrFail({
        where: { id: review.id },
        relations: ['user'],
      });
      return toReviewResponse(saved);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('You have already reviewed this product');
      }
      throw new BadRequestException('Could not submit review');
    }
  }
}
