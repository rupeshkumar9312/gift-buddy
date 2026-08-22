import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutOfAreaOrder } from './entities/out-of-area-order.entity';
import { CreateOutOfAreaOrderDto } from './dto/create-out-of-area-order.dto';

@Injectable()
export class OutOfAreaOrdersService {
  constructor(
    @InjectRepository(OutOfAreaOrder)
    private readonly outOfAreaOrdersRepository: Repository<OutOfAreaOrder>,
  ) {}

  async create(dto: CreateOutOfAreaOrderDto): Promise<{ received: true }> {
    await this.outOfAreaOrdersRepository.save(
      this.outOfAreaOrdersRepository.create({
        email: dto.email,
        address: {
          firstName: dto.address.firstName,
          lastName: dto.address.lastName,
          line1: dto.address.line1,
          line2: dto.address.line2,
          city: dto.address.city,
          region: dto.address.region,
          postalCode: dto.address.postalCode,
          country: dto.address.country,
          phone: dto.address.phone ?? null,
        },
        items: dto.items,
        subtotal: dto.subtotal.toFixed(2),
      }),
    );
    return { received: true };
  }
}
