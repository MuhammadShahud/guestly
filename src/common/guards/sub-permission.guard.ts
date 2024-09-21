import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUser } from 'src/user/interfaces/user.interface';
import { matchPermissions } from 'src/utils/utils.helper';
@Injectable()
export class SubPermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>(
      'subPermission',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user as IUser;
    if (!user) return false;

    return matchPermissions(
      permissions,
      user?.permissions,
      //   user.permissions?.map((p) => p.sub).flat(),
    );
  }
}
