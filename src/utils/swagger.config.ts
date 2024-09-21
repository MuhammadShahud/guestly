import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerCustomOptions } from '@nestjs/swagger/dist/interfaces/swagger-custom-options.interface';
import { join } from 'path';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Guestly')
    .setDescription('Guestly apis version 1.0')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      layout: 'StandaloneLayout',
    },
    useGlobalPrefix: true,
    customSiteTitle: 'API Documentation',
    customfavIcon: join(__dirname, 'assets', 'favicon.ico'),
    customCss: '.swagger-ui .topbar { display: none }',
  };

  SwaggerModule.setup('docs', app, document, customOptions);
}
