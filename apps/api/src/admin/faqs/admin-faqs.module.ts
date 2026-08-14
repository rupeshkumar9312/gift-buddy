import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from '../../content/entities/faq.entity';
import { AdminFaqsController } from './admin-faqs.controller';
import { AdminFaqsService } from './admin-faqs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [AdminFaqsController],
  providers: [AdminFaqsService],
})
export class AdminFaqsModule {}
