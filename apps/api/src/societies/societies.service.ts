import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Society } from './entities/society.entity';

export type SocietyItem = { id: number; name: string };

@Injectable()
export class SocietiesService {
  constructor(
    @InjectRepository(Society)
    private readonly societiesRepository: Repository<Society>,
  ) {}

  async findActive(): Promise<SocietyItem[]> {
    const societies = await this.societiesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return societies.map((society) => ({
      id: society.id,
      name: society.name,
    }));
  }
}
