import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';

export type ShippingMethodResponse = {
  id: number;
  name: string;
  price: number;
  freeOverAmount: number | null;
};

function toResponse(method: ShippingMethod): ShippingMethodResponse {
  return {
    id: method.id,
    name: method.name,
    price: Number(method.price),
    freeOverAmount: method.freeOverAmount
      ? Number(method.freeOverAmount)
      : null,
  };
}

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepository: Repository<ShippingMethod>,
  ) {}

  async findActive(): Promise<ShippingMethodResponse[]> {
    const methods = await this.shippingRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
    return methods.map(toResponse);
  }

  async findById(id: number): Promise<ShippingMethod> {
    const method = await this.shippingRepository.findOne({
      where: { id, isActive: true },
    });
    if (!method) {
      throw new NotFoundException(`Shipping method ${id} not found`);
    }
    return method;
  }

  costFor(method: ShippingMethod, subtotal: number): number {
    const price = Number(method.price);
    const freeOver = method.freeOverAmount
      ? Number(method.freeOverAmount)
      : null;
    if (freeOver !== null && subtotal >= freeOver) {
      return 0;
    }
    return price;
  }
}
