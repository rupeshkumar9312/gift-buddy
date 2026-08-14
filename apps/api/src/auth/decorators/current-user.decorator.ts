import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserPayload = { userId: number; email: string | null };

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentUserPayload }>();
    return request.user;
  },
);
