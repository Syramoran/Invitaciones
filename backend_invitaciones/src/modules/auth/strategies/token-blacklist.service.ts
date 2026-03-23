// src/modules/auth/token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenBlacklistService {
  private readonly blacklist = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  add(token: string): void {
    this.blacklist.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  /**
   * Limpia tokens ya expirados para evitar que el Set crezca indefinidamente.
   * Llamalo desde un @Cron() si usás @nestjs/schedule, o ignoralo
   * si el volumen de logouts es bajo (los tokens se invalidan solos al expirar).
   */
  purgeExpired(): void {
    for (const token of this.blacklist) {
      try {
        this.jwtService.verify(token);
      } catch {
        // Si verify() lanza (token expirado o inválido), lo sacamos
        this.blacklist.delete(token);
      }
    }
  }
}