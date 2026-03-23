import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../../entities';
import { UsuarioService } from './usuario.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [UsuarioService],
  exports: [UsuarioService], // AuthModule (y cualquier otro módulo futuro) puede inyectarlo
})
export class UsuarioModule {}