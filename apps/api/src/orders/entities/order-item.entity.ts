import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

// Immutable snapshot of a product at time of purchase — product_name, sku,
// and unit_price are copied here so a later product edit or price change
// never rewrites history on a past order.
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'product_id', nullable: true })
  productId: number | null;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  productSlug: string | null;

  @Column({ type: 'varchar', length: 60 })
  sku: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  productImage: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: string;

  // Snapshotted from product.returnDays at checkout, same reasoning as the
  // other fields on this entity — null/0 means not returnable, independent
  // of whatever the product's setting is later changed to.
  @Column({ type: 'int', nullable: true })
  returnDays: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
