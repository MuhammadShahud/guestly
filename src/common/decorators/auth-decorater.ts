import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../guards/role.guard';
import { Role } from './user.decorater';

export const AuthDecorator = (...roles: string[]) => {
  return applyDecorators(UseGuards(AuthGuard(), RoleGuard), Role(...roles));
};
