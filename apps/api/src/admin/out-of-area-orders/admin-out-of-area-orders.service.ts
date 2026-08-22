import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutOfAreaOrder } from '../../out-of-area-orders/entities/out-of-area-order.entity';

@Injectable()
export class AdminOutOfAreaOrdersService {
  constructor(
    @InjectRepository(OutOfAreaOrder)
    private readonly outOfAreaOrdersRepository: Repository<OutOfAreaOrder>,
  ) {}

  findAll(): Promise<OutOfAreaOrder[]> {
    return this.outOfAreaOrdersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.outOfAreaOrdersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Out-of-area order ${id} not found`);
    }
  }
}
