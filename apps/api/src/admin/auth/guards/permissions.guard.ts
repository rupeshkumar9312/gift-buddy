import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import type { CurrentAdminPayload } from '../decorators/current-admin.decorator';

/**
 * Checks the permission set already embedded in the admin JWT (see
 * AdminJwtAccessStrategy) — no per-request DB hit. Must run after
 * AdminJwtAccessGuard so `request.user` is populated.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: CurrentAdminPayload }>();

    const hasAll = required.every((permission) =>
      user.permissions.includes(permission),
    );
    if (!hasAll) {
      throw new ForbiddenException('Missing required permission');
    }
    return true;
  }
}
