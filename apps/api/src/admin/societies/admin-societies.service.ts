import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Society } from '../../societies/entities/society.entity';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';

@Injectable()
export class AdminSocietiesService {
  constructor(
    @InjectRepository(Society)
    private readonly societiesRepository: Repository<Society>,
  ) {}

  findAll(): Promise<Society[]> {
    return this.societiesRepository.find({ order: { name: 'ASC' } });
  }

  create(dto: CreateSocietyDto): Promise<Society> {
    return this.societiesRepository.save(
      this.societiesRepository.create({
        name: dto.name,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(id: number, dto: UpdateSocietyDto): Promise<Society> {
    const society = await this.societiesRepository.findOne({ where: { id } });
    if (!society) {
      throw new NotFoundException(`Society ${id} not found`);
    }
    await this.societiesRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    });
    return this.societiesRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<void> {
    const result = await this.societiesRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Society ${id} not found`);
    }
  }
}
