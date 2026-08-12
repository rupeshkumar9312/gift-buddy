import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtAccessGuard extends AuthGuard('admin-jwt-access') {}
