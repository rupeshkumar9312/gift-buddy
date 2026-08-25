import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

export enum ReturnRequestStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ReturnRequestStatus.REQUESTED,
  })
  status: ReturnRequestStatus;

  @Column({ type: 'text', nullable: true })
  adminNote: string | null;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by_admin_id' })
  resolvedByAdmin: AdminUser | null;

  @Column({ name: 'resolved_by_admin_id', nullable: true })
  resolvedByAdminId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
