import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import * as Entities from './entities';

// ── Auth ──
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt.auth.guard';

// ── Módulos @Global (se importan una vez, disponibles en toda la app) ──
import { R2StorageModule } from './common/r2/r2-storage.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

// ── Módulos de entidades (CRUD independiente) ──
import { TiposEventoModule } from './modules/tipos-evento/tipos-evento.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PreciosModule } from './modules/precios/precios.module';

// ── Módulo central + sub-módulos ──
import { InvitacionesModule } from './modules/invitaciones/invitaciones.module';
import { HistoriasModule } from './modules/historia/historia.module';
import { InvitadosModule } from './modules/invitados/invitados.module';
import { GaleriaModule } from './modules/galeria/galeria.module';
import { MusicaModule } from './modules/musica/musica.module';

// ── Cron jobs ──
import { CronJobsModule } from './modules/cron-jobs/cron-jobs.module';

@Module({
  imports: [
    // ── Configuración global ──
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Servidor
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

        // Base de datos
        DATABASE_URL: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('8h'),

        // Cloudflare R2
        R2_ACCESS_KEY_ID: Joi.string().required(),
        R2_SECRET_ACCESS_KEY: Joi.string().required(),
        R2_ENDPOINT: Joi.string().required(),
        R2_BUCKET_NAME: Joi.string().required(),
        R2_PUBLIC_URL: Joi.string().required(),

        // App
        FRONTEND_URL: Joi.string().default('https://invitaciones.com'),
        WHATSAPP_NUMBER: Joi.string().default(''),
        ADMIN_EMAIL: Joi.string().email().default('admin@invitaciones.com'),

        // Rate limiting
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
    }),

    // ── Rate limiting: 100 req/min por IP ──
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // ── Base de datos ──
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: Object.values(Entities).filter(
          (item) => typeof item === 'function',
        ),
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    // ── Cron jobs (@nestjs/schedule) ──
    ScheduleModule.forRoot(),

    // ── Auth ──
    AuthModule,

    // ── Módulos @Global ──
    R2StorageModule,
    NotificacionesModule,

    // ── Entidades independientes ──
    TiposEventoModule,
    TemplatesModule,
    ServiciosModule,
    PedidosModule,
    PreciosModule,

    // ── Invitaciones + sub-módulos ──
    InvitacionesModule,
    HistoriasModule,
    InvitadosModule,
    GaleriaModule,
    MusicaModule,

    // ── Cron jobs ──
    CronJobsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}