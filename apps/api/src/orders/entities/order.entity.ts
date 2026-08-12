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
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  FULFILLED = 'fulfilled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export type OrderAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string | null;
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  orderNumber: string;

  // Nullable — guest checkout creates an order without a user account;
  // POST /orders/track looks it up by orderNumber + email instead.
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingTotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxTotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountTotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency: string;

  // Snapshotted at checkout rather than an FK to `addresses`, since guest
  // orders have no user row to own a saved address.
  @Column({ type: 'json' })
  shippingAddress: OrderAddress;

  @Column({ type: 'json' })
  billingAddress: OrderAddress;

  @Column({ type: 'varchar', length: 120 })
  shippingMethodName: string;

  @Column({ type: 'datetime', nullable: true })
  placedAt: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, {
    cascade: true,
  })
  statusHistory: OrderStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
