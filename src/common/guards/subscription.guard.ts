import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { Reflector } from '@nestjs/core';
import { IUser } from 'src/user/interfaces/user.interface';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IUser;
    const activeStatus = user?.currentOrganization?.active;

    if (!activeStatus) return false;

    if ('package-expired' === activeStatus) {
      throw new UnauthorizedException('Subscription expired. Please renew.');
    } else if ('package-cancelled' === activeStatus) {
      throw new UnauthorizedException(
        'Subscription canceled. Please resubscribe to access our services.',
      );
    } else if ('subscription-pending' === activeStatus) {
      throw new UnauthorizedException(
        'Please subscribe first to access to our services.',
      );
    }

    return true;
  }
}
