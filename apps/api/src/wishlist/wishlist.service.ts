import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { toWishlistResponse, WishlistItemResponse } from './wishlist.mapper';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private itemRelations() {
    return ['product', 'product.images', 'product.images.asset'];
  }

  private async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({ where: { userId } });
    if (!wishlist) {
      wishlist = await this.wishlistRepository.save(
        this.wishlistRepository.create({ userId }),
      );
    }
    return wishlist;
  }

  async findForUser(userId: number): Promise<WishlistItemResponse[]> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });
    if (!wishlist) return [];
    const items = await this.wishlistItemRepository.find({
      where: { wishlistId: wishlist.id },
      relations: this.itemRelations(),
      order: { addedAt: 'DESC' },
    });
    return toWishlistResponse(items);
  }

  async addItem(
    userId: number,
    productId: number,
  ): Promise<WishlistItemResponse[]> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const wishlist = await this.getOrCreateWishlist(userId);
    const existing = await this.wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });
    if (!existing) {
      await this.wishlistItemRepository.save(
        this.wishlistItemRepository.create({
          wishlistId: wishlist.id,
          productId,
        }),
      );
    }
    return this.findForUser(userId);
  }

  async removeItem(
    userId: number,
    productId: number,
  ): Promise<WishlistItemResponse[]> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });
    if (wishlist) {
      await this.wishlistItemRepository.delete({
        wishlistId: wishlist.id,
        productId,
      });
    }
    return this.findForUser(userId);
  }
}
