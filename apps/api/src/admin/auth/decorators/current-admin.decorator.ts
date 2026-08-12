import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentAdminPayload = {
  adminId: number;
  email: string;
  role: string;
  permissions: string[];
};

export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentAdminPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentAdminPayload }>();
    return request.user;
  },
);
