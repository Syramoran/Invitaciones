import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet
  app.use(helmet());

  // 2. CORS
  app.enableCors({
    origin: [
      /\.vercel\.app$/,            // Permite cualquier subdominio de Vercel
      'https://tu-app.vercel.app'  // Tu dominio específico de producción
    ],
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
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();