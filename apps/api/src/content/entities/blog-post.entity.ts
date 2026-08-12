import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slug: string;

  @Column({ type: 'varchar', length: 220 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cover_asset_id' })
  coverAsset: MediaAsset | null;

  @Column({ name: 'cover_asset_id', nullable: true })
  coverAssetId: number | null;

  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_admin_id' })
  authorAdmin: AdminUser | null;

  @Column({ name: 'author_admin_id', nullable: true })
  authorAdminId: number | null;

  @Column({ type: 'varchar', length: 20, default: BlogPostStatus.DRAFT })
  status: BlogPostStatus;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
