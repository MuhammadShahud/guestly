import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { IUser } from 'src/user/interfaces/user.interface';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): IUser => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user as IUser;
  },
);

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const subPermission = (...subPermission: string[]) =>
  SetMetadata('subPermission', subPermission);

export const Role = (...role: string[]) => SetMetadata('role', role);
