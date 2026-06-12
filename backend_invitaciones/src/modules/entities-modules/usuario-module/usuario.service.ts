import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../../entities';

export interface CreateUsuarioData {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  emailVerificado: boolean;
}

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
   * Busca un usuario por email.
   * Usado por AuthService para detectar emails duplicados en el registro.
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email },
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

  /**
   * Crea un nuevo usuario.
   * Usado por AuthService.register().
   */
  async create(data: CreateUsuarioData): Promise<Usuario> {
    const usuario = this.usuarioRepository.create({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      emailVerificado: data.emailVerificado,
    });
    return this.usuarioRepository.save(usuario);
  }

  /**
   * Marca el email del usuario como verificado.
   */
  async markEmailVerified(id: number): Promise<void> {
    await this.usuarioRepository.update(id, { emailVerificado: true });
  }

  /**
   * Actualiza la contraseña del usuario.
   * Usado por AuthService en el reset de contraseña.
   */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.usuarioRepository.update(id, { passwordHash });
  }
}