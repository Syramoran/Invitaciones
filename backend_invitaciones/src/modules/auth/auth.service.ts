// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './hash.service';
import { UsuarioService } from '../entities-modules/usuario-module/usuario.service';
import { Usuario } from '../../entities';
import { LoginResponseDto, UserDataDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuarioService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  // Busca y verifica la contraseña. Retorna el usuario (sin hash) o null.
  async validateUser(username: string, pass: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
    const user = await this.usuariosService.findByUsername(username);

    if (user && await this.hashService.verify(user.passwordHash, pass)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  // Firma el JWT y arma la respuesta tipada
  async login(user: Omit<Usuario, 'passwordHash'>): Promise<LoginResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const userData: UserDataDto = {
      id: user.id,
      username: user.username,
      email: user.email, 
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userData,
    };
  }
}