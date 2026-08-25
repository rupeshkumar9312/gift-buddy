import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import {
  ReturnRequest,
  ReturnRequestStatus,
} from '../../returns/entities/return-request.entity';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import {
  AdminReturnRequestSummary,
  toAdminReturnRequestSummary,
} from './admin-return-requests.mapper';

@Injectable()
export class AdminReturnRequestsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRequestRepository: Repository<ReturnRequest>,
    private readonly mailService: MailService,
  ) {}

  async findAll(
    status?: ReturnRequestStatus,
  ): Promise<AdminReturnRequestSummary[]> {
    const requests = await this.returnRequestRepository.find({
      where: status ? { status } : {},
      relations: ['order', 'orderItem'],
      order: { createdAt: 'DESC' },
    });
    return requests.map(toAdminReturnRequestSummary);
  }

  async updateStatus(
    id: number,
    dto: UpdateReturnRequestDto,
    adminId: number,
  ): Promise<AdminReturnRequestSummary> {
    const request = await this.returnRequestRepository.findOne({
      where: { id },
      relations: ['order', 'orderItem'],
    });
    if (!request) {
      throw new NotFoundException(`Return request ${id} not found`);
    }
    if (request.status !== ReturnRequestStatus.REQUESTED) {
      throw new BadRequestException(
        'Only pending return requests can be approved or rejected.',
      );
    }

    request.status = dto.status;
    request.adminNote = dto.adminNote ?? null;
    request.resolvedAt = new Date();
    request.resolvedByAdminId = adminId;
    await this.returnRequestRepository.save(request);

    await this.mailService.sendReturnRequestUpdate({
      to: request.order.email,
      orderNumber: request.order.orderNumber,
      productName: request.orderItem.productName,
      status: dto.status,
    });

    return toAdminReturnRequestSummary(request);
  }
}
