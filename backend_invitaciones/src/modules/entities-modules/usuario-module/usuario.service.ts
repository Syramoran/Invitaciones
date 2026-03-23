import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../../entities';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Busca un usuario por username.
   * Incluye password_hash para que AuthService pueda verificar credenciales.
   * Retorna null si no existe (no lanza excepción — AuthService decide qué hacer).
   */
  async findByUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { username },
    });
  }

  /**
   * Busca un usuario por ID.
   * Usado por JwtStrategy para hidratar req.user en cada request autenticado.
   * Lanza NotFoundException si el usuario fue eliminado entre requests.
   */
  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return usuario;
  }
}