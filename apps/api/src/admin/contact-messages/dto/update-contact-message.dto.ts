import { IsEnum } from 'class-validator';
import { ContactMessageStatus } from '../../../content/entities/contact-message.entity';

export class UpdateContactMessageDto {
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;
}
