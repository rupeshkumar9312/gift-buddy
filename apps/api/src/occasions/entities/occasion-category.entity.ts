import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Occasion } from './occasion.entity';

// A category that exists only inside one Occasion's own landing page —
// deliberately NOT a Category row. A product's real category
// (Product.categoryId) drives general site-wide browsing and stays
// untouched; this is a separate, lightweight per-occasion tag that can
// only ever be applied to products already part of that occasion's own
// resolved gift list (enforced in AdminOccasionsService, not the DB).
@Entity('occasion_categories_custom')
@Index(['occasionId', 'slug'], { unique: true })
export class OccasionCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Occasion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occasion_id' })
  occasion: Occasion;

  @Column({ name: 'occasion_id' })
  occasionId: number;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 160 })
  slug: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'occasion_category_products',
    joinColumn: { name: 'occasion_category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
