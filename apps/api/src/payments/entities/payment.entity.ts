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
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  REQUIRES_PAYMENT = 'requires_payment',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ type: 'varchar', length: 30, default: 'stripe' })
  provider: string;

  // Stripe PaymentIntent id — makes the webhook handler idempotent under
  // Stripe's at-least-once retry delivery.
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  providerRef: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.REQUIRES_PAYMENT,
  })
  status: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  rawPayload: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
