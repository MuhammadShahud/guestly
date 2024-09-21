// import "./instrument";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { socketsHandler } from './socket/socket.gateway';
import { raw } from 'body-parser';
import { setupSwagger } from './utils/swagger.config';


declare const module: any;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['warn', 'error'],
  });

  // enabling cors
  app.enableCors();
  app.use(cookieParser());
  app.use(compression());
  // enabling configService

  // global pipe setup
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use('/api/v1/package/webhook', raw({ type: 'application/json' }));

  // global prefix setup
  app.setGlobalPrefix('api/v1');

  app.setViewEngine('ejs');

  // web pack configuration
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  setupSwagger(app);

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

let server: Handler;
console.log('Turning on the server');

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());

  if (event?.requestContext?.routeKey) {
    return socketsHandler(event, context);
  }

  return server(event, context, callback);
};
