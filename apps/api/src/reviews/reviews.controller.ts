import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews/featured')
  findFeatured(@Query('limit') limit?: string) {
    return this.reviewsService.findFeatured(limit ? Number(limit) : undefined);
  }

  @Get('products/:slug/reviews')
  findForProduct(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findApprovedForProduct(
      slug,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Post('products/:slug/reviews')
  @UseGuards(JwtAccessGuard)
  create(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(slug, user.userId, dto);
  }
}
