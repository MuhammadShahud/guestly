import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IUser } from 'src/user/interfaces/user.interface';
import { matchRoles } from 'src/utils/utils.helper';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflactor: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflactor.get<string[]>('roles', context.getHandler());

    // for public routes
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user: IUser = request.user;

    //  if there is no protect called in case
    if (!user) return false;

    return matchRoles(roles, user.role);
  }
}
