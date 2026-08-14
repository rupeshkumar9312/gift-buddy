import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(JwtAccessGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.wishlistService.findForUser(user.userId);
  }

  @Post('items/:productId')
  addItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.addItem(user.userId, productId);
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlistService.removeItem(user.userId, productId);
  }
}
