import { Review } from './entities/review.entity';

export type ReviewResponse = {
  id: number;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export function toReviewResponse(review: Review): ReviewResponse {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    authorName: review.user
      ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
      : 'GiftBuddy customer',
    createdAt: review.createdAt.toISOString(),
  };
}

export type FeaturedReviewResponse = ReviewResponse & {
  productName: string;
  productSlug: string;
};

export function toFeaturedReviewResponse(
  review: Review,
): FeaturedReviewResponse {
  return {
    ...toReviewResponse(review),
    productName: review.product.name,
    productSlug: review.product.slug,
  };
}
