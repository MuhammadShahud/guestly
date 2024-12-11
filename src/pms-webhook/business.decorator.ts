import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Business = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.business;
  },
);