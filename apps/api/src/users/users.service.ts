import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  findByEmailWithSecrets(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByIdWithSecrets(id: number): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  create(data: {
    email?: string;
    emailVerifiedAt?: Date;
    passwordHash?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    phoneVerifiedAt?: Date;
    googleId?: string;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async linkGoogleId(userId: number, googleId: string): Promise<void> {
    await this.usersRepository.update(userId, { googleId });
  }

  async setRefreshToken(
    userId: number,
    refreshTokenHash: string | null,
    expiresAt: Date | null,
  ) {
    await this.usersRepository.update(userId, {
      refreshTokenHash,
      refreshTokenExpiresAt: expiresAt,
    });
  }
}
