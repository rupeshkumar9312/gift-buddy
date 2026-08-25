import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequest } from './entities/return-request.entity';
import { ReturnsService } from './returns.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnRequest])],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
