import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Usuario } from '../../entities';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { UsuarioService } from '../entities-modules/usuario-module/usuario.service';
import { LoginAttemptService } from './login-attempt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { TokenBlacklistService } from './strategies/token-blacklist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'), 
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any, 
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,
    HashService,
    JwtStrategy,
    JwtAuthGuard,
    LoginAttemptService,
    TokenBlacklistService,
    UsuarioService
  ],
  exports: [JwtModule, PassportModule, HashService, JwtAuthGuard],
})
export class AuthModule { }
