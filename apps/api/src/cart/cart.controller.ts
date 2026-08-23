import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { OptionalJwtAccessGuard } from '../auth/guards/optional-jwt-access.guard';
import { CartService, type CartIdentity } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

export const CART_COOKIE = 'cart_token';
const CART_COOKIE_PATH = '/api/v1';

@Controller('cart')
@UseGuards(OptionalJwtAccessGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async getCart(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
  ) {
    const cart = await this.cartService.findActiveCart(
      this.identity(user, req),
    );
    return this.cartService.toResponse(cart);
  }

  @Post('items')
  async addItem(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ) {
    const { cart, newGuestToken } =
      await this.cartService.getOrCreateActiveCart(this.identity(user, req));
    if (newGuestToken) {
      this.setCartCookie(req, res, newGuestToken);
    }
    const updated = await this.cartService.addItem(
      cart,
      dto.productId,
      dto.quantity,
    );
    return this.cartService.toResponse(updated);
  }

  @Patch('items/:productId')
  async updateItem(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.findActiveCart(
      this.identity(user, req),
    );
    if (!cart) {
      return this.cartService.toResponse(null);
    }
    const updated = await this.cartService.updateItemQuantity(
      cart,
      productId,
      dto.quantity,
    );
    return this.cartService.toResponse(updated);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  async removeItem(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const cart = await this.cartService.findActiveCart(
      this.identity(user, req),
    );
    if (!cart) {
      return this.cartService.toResponse(null);
    }
    const updated = await this.cartService.removeItem(cart, productId);
    return this.cartService.toResponse(updated);
  }

  @Post('coupon')
  async applyCoupon(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
    @Body() dto: ApplyCouponDto,
  ) {
    const cart = await this.cartService.findActiveCart(
      this.identity(user, req),
    );
    if (!cart) {
      throw new BadRequestException('Your cart is empty');
    }
    const updated = await this.cartService.applyCoupon(cart, dto.code);
    return this.cartService.toResponse(updated);
  }

  @Delete('coupon')
  @HttpCode(HttpStatus.OK)
  async removeCoupon(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
  ) {
    const cart = await this.cartService.findActiveCart(
      this.identity(user, req),
    );
    if (!cart) {
      return this.cartService.toResponse(null);
    }
    const updated = await this.cartService.removeCoupon(cart);
    return this.cartService.toResponse(updated);
  }

  private identity(
    user: CurrentUserPayload | undefined,
    req: Request,
  ): CartIdentity {
    const cookies = req.cookies as Record<string, string | undefined>;
    return {
      userId: user?.userId ?? null,
      guestToken: cookies?.[CART_COOKIE] ?? null,
    };
  }

  private setCartCookie(req: Request, res: Response, guestToken: string) {
    // SameSite=Lax cookies are never sent back on cross-site fetch/XHR calls
    // (only top-level navigations) — when the frontend and this API are on
    // different sites (a local dev frontend hitting the deployed Render API,
    // or a Vercel frontend hitting a Render API), the guest token cookie set
    // by the first add-to-cart call would never round-trip on the next one,
    // so every "add" silently started a brand-new guest cart instead of
    // appending to the existing one.
    //
    // This used to key off NODE_ENV === 'production', which silently never
    // fired because Render doesn't set that for every service type.
    // req.secure reflects the X-Forwarded-Proto header Render/Cloudflare
    // actually set for this request (trust proxy is enabled in main.ts), so
    // it's correct regardless of any env var.
    const isHttps = req.secure;
    res.cookie(CART_COOKIE, guestToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      path: CART_COOKIE_PATH,
      maxAge: this.config.getOrThrow<number>('cart.cookieTtlMs'),
    });
  }
}
