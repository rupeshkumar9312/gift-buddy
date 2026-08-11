import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'GiftBuddy API',
      status: 'ok',
      health: '/health',
    };
  }
}
