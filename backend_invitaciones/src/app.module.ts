import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Entities from './entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TiposEventoModule } from './modules/tipos-evento/tipos-evento.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { InvitacionesModule } from './modules/invitaciones/invitaciones.module';
import { HistoriaModule } from './modules/historia/historia.module';
import { InvitadosModule } from './modules/invitados/invitados.module';
import { GaleriaModule } from './modules/galeria/galeria.module';
import { MusicaModule } from './modules/musica/musica.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { PreciosModule } from './modules/precios/precios.module';
import * as Joi from 'joi';
import { JwtAuthGuard } from './modules/auth/guards/jwt.auth.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto en milisegundos
      limit: 100, // Máximo 100 peticiones
    }]),
    ConfigModule.forRoot({
      isGlobal: true, 
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('8h'),
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        // Object.values convierte el barril en un array de clases que TypeORM entiende
        entities: Object.values(Entities).filter(item => typeof item === 'function'),
        synchronize: false, // Mantenelo en false porque ya tenés los datos en pgAdmin [cite: 168, 169]
        logging: true,
      }),
    }),
    AuthModule,
    TiposEventoModule,
    TemplatesModule,
    ServiciosModule,
    PedidosModule,
    InvitacionesModule,
    HistoriaModule,
    InvitadosModule,
    GaleriaModule,
    MusicaModule,
    NotificacionesModule,
    PreciosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica el límite globalmente
    },
    {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // Luego el de autenticación
  },
  ],
})
export class AppModule { }