import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequest } from '../../returns/entities/return-request.entity';
import { MailModule } from '../../mail/mail.module';
import { AdminReturnRequestsController } from './admin-return-requests.controller';
import { AdminReturnRequestsService } from './admin-return-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnRequest]), MailModule],
  controllers: [AdminReturnRequestsController],
  providers: [AdminReturnRequestsService],
})
export class AdminReturnRequestsModule {}
