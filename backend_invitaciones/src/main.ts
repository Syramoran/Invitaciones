import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Railway mete un único salto de proxy delante del backend, y limpia el
  // header X-Forwarded-For en su borde (un cliente no puede falsificar el
  // propio). Sin esto, Express toma como IP la del proxy de Railway para
  // todo el mundo, así que el rate limit (100 req/min) termina compartido
  // entre todos los invitados en vez de aplicarse por persona.
  app.set('trust proxy', 1);

  // 1. Helmet
  app.use(helmet());

  // 2. CORS
  app.enableCors({
    origin: [
      /\.vercel\.app$/,            // Permite cualquier subdominio de Vercel
      'https://tu-app.vercel.app',
      'http://localhost:5173',
      /^http:\/\/192\.168\.\d+\.\d+:5173$/,  // Red local (probar desde el celular)
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
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();