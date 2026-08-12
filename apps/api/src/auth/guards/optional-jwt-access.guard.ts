import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Same JWT strategy as JwtAccessGuard, but never rejects the request —
 * a missing or invalid access token just leaves req.user undefined, so
 * routes that serve both guests and signed-in users (cart, checkout) can
 * use a single code path.
 */
@Injectable()
export class OptionalJwtAccessGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
