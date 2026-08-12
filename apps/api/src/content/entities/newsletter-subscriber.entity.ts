import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @CreateDateColumn({ name: 'subscribed_at' })
  subscribedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  unsubscribedAt: Date | null;
}
