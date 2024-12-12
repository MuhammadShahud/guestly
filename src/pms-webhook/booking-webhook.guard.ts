import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { PMSService } from 'src/pms/pms.service';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  constructor(private pmsService: PMSService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Authentication required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const pms = await this.pmsService.findByApiUsername(username);
    if (!pms) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const isValidPassword = await compare(password, pms.password);
    if (password !== pms.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    request.business = pms.business;
    return true;
  }
}