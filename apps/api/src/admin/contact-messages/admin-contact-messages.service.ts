import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../content/entities/contact-message.entity';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@Injectable()
export class AdminContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  findAll(): Promise<ContactMessage[]> {
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  async update(
    id: number,
    dto: UpdateContactMessageDto,
  ): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Contact message ${id} not found`);
    }
    message.status = dto.status;
    return this.contactRepository.save(message);
  }
}
