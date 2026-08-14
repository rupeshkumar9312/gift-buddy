import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq, FaqGroup } from '../entities/faq.entity';

export type FaqItem = { id: number; question: string; answer: string };
export type GroupedFaqs = Record<FaqGroup, FaqItem[]>;

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqsRepository: Repository<Faq>,
  ) {}

  async findGrouped(): Promise<GroupedFaqs> {
    const faqs = await this.faqsRepository.find({
      order: { group: 'ASC', sortOrder: 'ASC' },
    });

    const grouped: GroupedFaqs = {
      [FaqGroup.SHIPPING]: [],
      [FaqGroup.RETURNS]: [],
      [FaqGroup.ORDERS]: [],
    };
    for (const faq of faqs) {
      grouped[faq.group].push({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
      });
    }
    return grouped;
  }
}
