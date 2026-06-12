// src/modules/auth/token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TokenBlacklist } from '../../../entities';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
  ) {}

  async add(token: string, expiresAt: Date): Promise<void> {
    await this.tokenBlacklistRepository.save({
      token,
      expiresAt,
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const found = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });
    return !!found;
  }

  /**
   * Limpia tokens ya expirados de la BD para evitar que crezca indefinidamente.
   * Llamalo desde un @Cron() o de forma periódica.
   */
  async purgeExpired(): Promise<void> {
    await this.tokenBlacklistRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}