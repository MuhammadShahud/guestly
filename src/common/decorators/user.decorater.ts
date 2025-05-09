import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const subPermission = (...subPermission: string[]) =>
  SetMetadata('subPermission', subPermission);

export const Role = (...role: string[]) => SetMetadata('role', role);
