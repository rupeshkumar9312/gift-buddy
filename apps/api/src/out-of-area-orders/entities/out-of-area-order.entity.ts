import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type OutOfAreaAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string | null;
};

export type OutOfAreaItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

// Captured when a customer types a society/apartment name at checkout that
// doesn't match any society we currently serve — this is never turned into
// a real Order (no payment, no stock decrement), it just preserves what
// they wanted to buy and where, so admins can follow up once that area is
// serviceable.
@Entity('out_of_area_orders')
export class OutOfAreaOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'json' })
  address: OutOfAreaAddress;

  @Column({ type: 'json' })
  items: OutOfAreaItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: string;

  @CreateDateColumn()
  createdAt: Date;
}
