import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // Se ejecuta automáticamente al arrancar el módulo
  async onModuleInit() {
    const usuarios = await this.usuarioRepository.count();
    console.log(`--- Prueba de Conexión: ${usuarios} usuarios encontrados en la DB ---`);
  }

  async testQuery() {
    return await this.usuarioRepository.find();
  }
}