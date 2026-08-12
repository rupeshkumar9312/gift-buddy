import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { ContactMessage } from '../entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<{ received: true }> {
    await this.contactRepository.save(
      this.contactRepository.create({
        name: dto.name,
        email: dto.email,
        subject: dto.subject ?? null,
        message: dto.message,
      }),
    );
    await this.mailService.sendContactAck({ to: dto.email, name: dto.name });
    return { received: true };
  }
}
