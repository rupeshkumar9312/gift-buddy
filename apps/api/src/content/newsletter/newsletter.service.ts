import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { NewsletterSubscriber } from '../entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    private readonly mailService: MailService,
  ) {}

  async subscribe(email: string): Promise<{ subscribed: true }> {
    const existing = await this.subscriberRepository.findOne({
      where: { email },
    });
    if (existing) {
      if (existing.unsubscribedAt) {
        existing.unsubscribedAt = null;
        await this.subscriberRepository.save(existing);
      }
      return { subscribed: true };
    }

    await this.subscriberRepository.save(
      this.subscriberRepository.create({ email }),
    );
    await this.mailService.sendNewsletterWelcome({ to: email });
    return { subscribed: true };
  }
}
