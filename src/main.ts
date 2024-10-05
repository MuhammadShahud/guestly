// import "./instrument";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import chalk from 'chalk';
import { raw } from 'body-parser';
import { setupSwagger } from './utils/swagger.config';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['warn', 'error'],
  });

  // enabling cors
  app.enableCors();
  app.use(cookieParser());
  app.use(compression());
  // enabling configService
  const configService = app.get(ConfigService);
  // global pipe setup
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use('/api/v1/package/webhook', raw({ type: 'application/json' }));

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const broadcastQueue = app.get<Queue>(getQueueToken('broadcast'));

  createBullBoard({
    queues: [new BullAdapter(broadcastQueue)],
    serverAdapter: serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  // global prefix setup
  app.setGlobalPrefix('api/v1');

  app.setViewEngine('ejs');

  // web pack configuration
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  setupSwagger(app);

  const PORT = await configService.get('PORT');

  await app.listen(PORT, () => {
    console.log(`${chalk.cyanBright(`SERVER IS LISTENING ON ${PORT}`)}`);
  });
}
bootstrap();
