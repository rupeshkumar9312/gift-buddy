import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CouponsService } from '../coupons/coupons.service';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartResponse, toCartResponse } from './cart.mapper';

export type CartIdentity = { userId: number | null; guestToken: string | null };

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponsService: CouponsService,
  ) {}

  private itemRelations() {
    return ['product', 'product.images', 'product.images.asset'];
  }

  /** Read-only lookup — never creates a cart, used by GET /cart. */
  async findActiveCart(identity: CartIdentity): Promise<Cart | null> {
    if (identity.userId) {
      return this.cartRepository.findOne({
        where: { userId: identity.userId, status: CartStatus.ACTIVE },
      });
    }
    if (identity.guestToken) {
      return this.cartRepository.findOne({
        where: { guestToken: identity.guestToken, status: CartStatus.ACTIVE },
      });
    }
    return null;
  }

  /**
   * Finds or creates the active cart for this request. Returns a freshly
   * generated guest token only when a brand-new anonymous cart was created —
   * the caller is responsible for setting it as a cookie.
   */
  async getOrCreateActiveCart(
    identity: CartIdentity,
  ): Promise<{ cart: Cart; newGuestToken: string | null }> {
    if (identity.userId) {
      let cart = await this.cartRepository.findOne({
        where: { userId: identity.userId, status: CartStatus.ACTIVE },
      });
      if (!cart) {
        cart = await this.cartRepository.save(
          this.cartRepository.create({
            userId: identity.userId,
            status: CartStatus.ACTIVE,
          }),
        );
      }
      return { cart, newGuestToken: null };
    }

    if (identity.guestToken) {
      const cart = await this.cartRepository.findOne({
        where: { guestToken: identity.guestToken, status: CartStatus.ACTIVE },
      });
      if (cart) {
        return { cart, newGuestToken: null };
      }
    }

    const guestToken = randomBytes(24).toString('hex');
    const cart = await this.cartRepository.save(
      this.cartRepository.create({ guestToken, status: CartStatus.ACTIVE }),
    );
    return { cart, newGuestToken: guestToken };
  }

  async toResponse(cart: Cart | null): Promise<CartResponse> {
    if (!cart) {
      return toCartResponse(null, []);
    }
    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
      relations: this.itemRelations(),
      order: { createdAt: 'ASC' },
    });

    if (!cart.couponCode) {
      return toCartResponse(cart.id, items);
    }

    // Re-validated on every read rather than trusted from storage — a coupon
    // that expired or hit its usage limit since it was applied should simply
    // stop discounting, not throw on every GET /cart.
    const subtotal = toCartResponse(cart.id, items).subtotal;
    try {
      const coupon = await this.couponsService.resolve(
        cart.couponCode,
        subtotal,
      );
      const discount = this.couponsService.computeDiscount(coupon, subtotal);
      return toCartResponse(cart.id, items, { code: coupon.code, discount });
    } catch {
      return toCartResponse(cart.id, items);
    }
  }

  /** Validates the code against the current cart subtotal and stores it on the cart. */
  async applyCoupon(cart: Cart, code: string): Promise<Cart> {
    const items = await this.loadItemsWithProducts(cart.id);
    const subtotal = toCartResponse(cart.id, items).subtotal;
    const coupon = await this.couponsService.resolve(code, subtotal);
    cart.couponCode = coupon.code;
    return this.cartRepository.save(cart);
  }

  async removeCoupon(cart: Cart): Promise<Cart> {
    cart.couponCode = null;
    return this.cartRepository.save(cart);
  }

  async addItem(
    cart: Cart,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    if (product.stockQty < 1) {
      throw new BadRequestException(`${product.name} is out of stock`);
    }

    const existing = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });
    const desiredQuantity = (existing?.quantity ?? 0) + quantity;
    const clampedQuantity = Math.min(desiredQuantity, product.stockQty);

    if (existing) {
      existing.quantity = clampedQuantity;
      await this.cartItemRepository.save(existing);
    } else {
      await this.cartItemRepository.save(
        this.cartItemRepository.create({
          cartId: cart.id,
          productId,
          quantity: clampedQuantity,
        }),
      );
    }

    return cart;
  }

  async updateItemQuantity(
    cart: Cart,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const item = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: ['product'],
    });
    if (!item) {
      throw new NotFoundException('That item is not in your cart');
    }
    item.quantity = Math.min(quantity, item.product.stockQty || quantity);
    await this.cartItemRepository.save(item);
    return cart;
  }

  async removeItem(cart: Cart, productId: number): Promise<Cart> {
    await this.cartItemRepository.delete({ cartId: cart.id, productId });
    return cart;
  }

  /**
   * On login/register, folds a guest cart into the user's cart: quantities
   * are unioned (higher wins per product), then the guest cart is marked
   * merged rather than deleted, for audit purposes.
   */
  async mergeGuestCartIntoUser(
    userId: number,
    guestToken: string,
  ): Promise<void> {
    const guestCart = await this.cartRepository.findOne({
      where: { guestToken, status: CartStatus.ACTIVE },
    });
    if (!guestCart) return;

    const guestItems = await this.cartItemRepository.find({
      where: { cartId: guestCart.id },
      relations: ['product'],
    });

    if (guestItems.length > 0) {
      const { cart: userCart } = await this.getOrCreateActiveCart({
        userId,
        guestToken: null,
      });

      for (const guestItem of guestItems) {
        const existing = await this.cartItemRepository.findOne({
          where: { cartId: userCart.id, productId: guestItem.productId },
        });
        const mergedQuantity = Math.max(
          existing?.quantity ?? 0,
          guestItem.quantity,
        );
        const clamped = Math.min(
          mergedQuantity,
          guestItem.product.stockQty || mergedQuantity,
        );

        if (existing) {
          existing.quantity = clamped;
          await this.cartItemRepository.save(existing);
        } else {
          await this.cartItemRepository.save(
            this.cartItemRepository.create({
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: clamped,
            }),
          );
        }
      }
    }

    await this.cartItemRepository.delete({ cartId: guestCart.id });
    guestCart.status = CartStatus.MERGED;
    await this.cartRepository.save(guestCart);
  }

  /** Called by checkout once an order snapshot has been taken from this cart. */
  async markConverted(cart: Cart): Promise<void> {
    cart.status = CartStatus.CONVERTED;
    await this.cartRepository.save(cart);
  }

  async loadItemsWithProducts(cartId: number): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { cartId },
      relations: this.itemRelations(),
      order: { createdAt: 'ASC' },
    });
  }
}
