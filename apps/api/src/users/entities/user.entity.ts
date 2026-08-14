import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';

export enum UserRole {
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Nullable — phone+OTP accounts (the only sign-up path now) have no email.
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // Nullable for the same reason — phone+OTP accounts never set a password.
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 120 })
  firstName: string;

  @Column({ type: 'varchar', length: 120 })
  lastName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'datetime', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  phoneVerifiedAt: Date | null;

  // Single active session for now — a new login simply issues a new refresh
  // token and overwrites this one. Multi-session support is a later add.
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash: string | null;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpiresAt: Date | null;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
