import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet
  app.use(helmet());

  // 2. CORS
  app.enableCors({
    origin: [
      /\.vercel\.app$/,            // Permite cualquier subdominio de Vercel
      'https://tu-app.vercel.app',
      'http://localhost:5173',
      process.env.FRONTEND_URL,    // Permite el dominio configurado en las variables de entorno
    ].filter(Boolean) as (string | RegExp)[],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('v1')
  
  const config = new DocumentBuilder()
    .setTitle('API de Invitaciones Digitales')
    .setDescription('Documentación de la API de Invitaciones Digitales')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();