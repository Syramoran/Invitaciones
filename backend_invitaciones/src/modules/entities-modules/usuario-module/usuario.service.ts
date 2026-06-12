import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, UserRole } from '../../../entities';

export interface CreateUsuarioData {
  username: string;
  email: string;
  passwordHash: string;
  nombreCompleto?: string;
  role?: UserRole;
  tokenVerificacion?: string;
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
   * Usado en el registro para evitar duplicados.
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
   * Busca un usuario por token de verificación de email.
   * Retorna null si no existe (token inválido o ya usado).
   */
  async findByTokenVerificacion(token: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { tokenVerificacion: token },
    });
  }

  /**
   * Crea un nuevo usuario (cliente o admin).
   * Lanza ConflictException si username o email ya existen.
   */
  async create(data: CreateUsuarioData): Promise<Usuario> {
    const existeUsername = await this.findByUsername(data.username);
    if (existeUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso.');
    }

    const existeEmail = await this.findByEmail(data.email);
    if (existeEmail) {
      throw new ConflictException('El email ya está registrado.');
    }

    const usuario = this.usuarioRepository.create({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      nombreCompleto: data.nombreCompleto,
      role: data.role ?? UserRole.CLIENTE,
      verificado: false,
      tokenVerificacion: data.tokenVerificacion ?? null,
    });

    return this.usuarioRepository.save(usuario);
  }

  /**
   * Activa la cuenta del usuario limpiando el token de verificación.
   */
  async activar(id: number): Promise<void> {
    await this.usuarioRepository.update(id, {
      verificado: true,
      tokenVerificacion: null,
    });
  }
}