import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// One row per phone number, upserted on every OTP request — a new request
// simply overwrites the previous code and resets attempts. Not tied to a
// User row since the phone may not have an account yet (sign-up case).
@Entity('otp_challenges')
export class OtpChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 255, select: false })
  codeHash: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
