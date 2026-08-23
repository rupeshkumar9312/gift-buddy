import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  slug: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  sku: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: string | null;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAvg: string;

  @Column({ default: 0 })
  ratingCount: number;

  @Column({ default: 0 })
  stockQty: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Null/0 = not returnable — storefront hides the "N-day easy returns" line
  // entirely. Defaults to 30 so existing products are unaffected.
  @Column({ type: 'int', nullable: true, default: 30 })
  returnDays: number | null;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get inStock(): boolean {
    return this.stockQty > 0;
  }

  get badge(): 'sale' | 'new' | 'hot' | null {
    if (this.salePrice) return 'sale';
    if (this.isFeatured) return 'hot';
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (this.createdAt && this.createdAt > thirtyDaysAgo) return 'new';
    return null;
  }
}
