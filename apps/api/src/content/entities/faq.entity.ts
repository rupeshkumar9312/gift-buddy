import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FaqGroup {
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  ORDERS = 'orders',
}

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  group: FaqGroup;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
