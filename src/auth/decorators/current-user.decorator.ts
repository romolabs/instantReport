import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type AuthenticatedUser } from '../types/auth.types';
import { type RequestWithUser } from '../types/request-with-user.type';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    context: ExecutionContext,
  ): AuthenticatedUser[keyof AuthenticatedUser] | AuthenticatedUser | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!data) {
      return user;
    }

    return user?.[data];
  },
);
