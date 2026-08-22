import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaAsset } from '../../media/entities/media-asset.entity';

// Singleton — always exactly one row (id 1), seeded by its migration so the
// homepage always has content to render. No create/delete, only get/update.
@Entity('home_hero')
export class HomeHero {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  eyebrow: string | null;

  @Column({ type: 'varchar', length: 200 })
  heading: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  primaryCtaLabel: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  primaryCtaHref: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  secondaryCtaLabel: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secondaryCtaHref: string | null;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'banner_image_asset_id' })
  bannerImage: MediaAsset | null;

  @Column({ name: 'banner_image_asset_id', nullable: true })
  bannerImageAssetId: number | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
