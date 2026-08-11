import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { toPublicUser } from '../auth/auth.mapper';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAccessGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() currentUser: CurrentUserPayload) {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(user);
  }
}
