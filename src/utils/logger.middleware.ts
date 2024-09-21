import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.ENVIRONMENT === 'dev') {
      res.on('finish', () => {
        console.log(
          `\n${chalk.yellow(req?.method)}${chalk.yellow('/')}${chalk.yellow(res?.statusCode)} ${chalk.yellow(req?.originalUrl)} ${chalk.bgCyan(req?.headers['user-agent']?.split(' ')[0])} ${req?.connection?.remoteAddress}`,
        );
      });
    }
    next();
  }
}
