import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

export enum LoginActorType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

// One row per successful login/register/sign-in event — never updated
// except to attach a GPS fix that arrives moments later (see
// LoginActivityService.attachGpsLocation). `SET NULL` on both relations so
// this audit trail survives account deletion rather than disappearing with it.
@Entity('login_activity')
export class LoginActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  actorType: LoginActorType;

  @Index()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @Index()
  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser | null;

  @Column({ name: 'admin_user_id', nullable: true })
  adminUserId: number | null;

  // 'password' | 'google' | 'otp'
  @Column({ type: 'varchar', length: 30 })
  method: string;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: string | null;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: string | null;

  // 'ip' | 'gps' | null (private/local IP during dev, lookup failed, etc.)
  @Column({ type: 'varchar', length: 10, nullable: true })
  locationSource: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
