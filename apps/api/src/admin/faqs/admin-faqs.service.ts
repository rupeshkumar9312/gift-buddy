import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../../content/entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class AdminFaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqsRepository: Repository<Faq>,
  ) {}

  findAll(): Promise<Faq[]> {
    return this.faqsRepository.find({
      order: { group: 'ASC', sortOrder: 'ASC' },
    });
  }

  create(dto: CreateFaqDto): Promise<Faq> {
    return this.faqsRepository.save(
      this.faqsRepository.create({
        group: dto.group,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
  }

  async update(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ ${id} not found`);
    }
    if (dto.group !== undefined) faq.group = dto.group;
    if (dto.question !== undefined) faq.question = dto.question;
    if (dto.answer !== undefined) faq.answer = dto.answer;
    if (dto.sortOrder !== undefined) faq.sortOrder = dto.sortOrder;
    return this.faqsRepository.save(faq);
  }

  async remove(id: number): Promise<void> {
    const result = await this.faqsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`FAQ ${id} not found`);
    }
  }
}
