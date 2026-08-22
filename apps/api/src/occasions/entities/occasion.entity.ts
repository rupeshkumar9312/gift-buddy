import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { Product } from '../../products/entities/product.entity';
import { OccasionCategory } from './occasion-category.entity';

@Entity('occasions')
export class Occasion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  slug: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  tagline: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'banner_image_asset_id' })
  bannerImage: MediaAsset | null;

  @Column({ name: 'banner_image_asset_id', nullable: true })
  bannerImageAssetId: number | null;

  @Column({ type: 'datetime', nullable: true })
  startsAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endsAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'occasion_categories',
    joinColumn: { name: 'occasion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'occasion_products',
    joinColumn: { name: 'occasion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @OneToMany(
    () => OccasionCategory,
    (occasionCategory) => occasionCategory.occasion,
  )
  occasionCategories: OccasionCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
