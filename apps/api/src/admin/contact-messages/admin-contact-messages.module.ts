import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from '../../content/entities/contact-message.entity';
import { AdminContactMessagesController } from './admin-contact-messages.controller';
import { AdminContactMessagesService } from './admin-contact-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  controllers: [AdminContactMessagesController],
  providers: [AdminContactMessagesService],
})
export class AdminContactMessagesModule {}
