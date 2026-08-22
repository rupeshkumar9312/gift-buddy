import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaAsset } from '../../media/entities/media-asset.entity';

@Entity('sale_banners')
export class SaleBanner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  badge: string | null;

  @Column({ type: 'varchar', length: 200 })
  heading: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  note: string | null;

  @Column({ type: 'varchar', length: 60 })
  ctaLabel: string;

  @Column({ type: 'varchar', length: 255 })
  ctaHref: string;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'banner_image_asset_id' })
  bannerImage: MediaAsset | null;

  @Column({ name: 'banner_image_asset_id', nullable: true })
  bannerImageAssetId: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
