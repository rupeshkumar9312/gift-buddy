import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { Product } from '../../products/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

export type AdminReviewResponse = {
  id: number;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  isFeatured: boolean;
  authorName: string;
  productName: string;
  productSlug: string;
  createdAt: string;
};

function toAdminReviewResponse(review: Review): AdminReviewResponse {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    isApproved: review.isApproved,
    isFeatured: review.isFeatured,
    authorName: `${review.user.firstName} ${review.user.lastName}`,
    productName: review.product.name,
    productSlug: review.product.slug,
    createdAt: review.createdAt.toISOString(),
  };
}

@Injectable()
export class AdminReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(
    query: AdminReviewQueryDto,
  ): Promise<PaginatedResponse<AdminReviewResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC');

    if (query.isApproved !== undefined) {
      qb.andWhere('review.isApproved = :isApproved', {
        isApproved: query.isApproved,
      });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [reviews, total] = await qb.getManyAndCount();

    return new PaginatedResponse(
      reviews.map(toAdminReviewResponse),
      total,
      page,
      limit,
    );
  }

  async update(id: number, dto: UpdateReviewDto): Promise<AdminReviewResponse> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    if (!review) {
      throw new NotFoundException(`Review ${id} not found`);
    }

    const approvalChanged =
      dto.isApproved !== undefined && dto.isApproved !== review.isApproved;

    if (dto.isApproved !== undefined) review.isApproved = dto.isApproved;
    if (dto.isFeatured !== undefined) review.isFeatured = dto.isFeatured;
    const saved = await this.reviewsRepository.save(review);

    if (approvalChanged) {
      await this.recalculateProductRating(review.productId);
    }

    return toAdminReviewResponse(saved);
  }

  // products.rating_avg / rating_count are denormalized from reviews (see
  // Section 03 of the analysis doc) — recomputed here whenever a review's
  // approval status changes, since only approved reviews should count.
  private async recalculateProductRating(productId: number): Promise<void> {
    const stats = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = true')
      .getRawOne<{ avg: string | null; count: string }>();

    await this.productsRepository.update(productId, {
      ratingAvg: (Number(stats?.avg) || 0).toFixed(2),
      ratingCount: Number(stats?.count ?? 0),
    });
  }
}
