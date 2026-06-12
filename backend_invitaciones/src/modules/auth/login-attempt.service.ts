// src/modules/auth/login-attempt.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginAttempt } from '../../entities';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

@Injectable()
export class LoginAttemptService {
  constructor(
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) { }

  async isBlocked(ip: string): Promise<boolean> {
    const record = await this.loginAttemptRepository.findOne({
      where: { ip },
    });

    if (!record?.lockedUntil) return false;

    if (new Date() < record.lockedUntil) {
      return true;
    }

    // El bloqueo expiró — lo limpiamos
    await this.loginAttemptRepository.delete({ ip });
    return false;
  }

  async registerFailure(ip: string): Promise<void> {
    const record = await this.loginAttemptRepository.findOne({
      where: { ip },
    });

    if (!record) {
      await this.loginAttemptRepository.save({
        ip,
        attemptCount: 1,
        lockedUntil: null,
      });
      return;
    }

    record.attemptCount += 1;

    if (record.attemptCount >= MAX_ATTEMPTS) {
      record.lockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
    }

    await this.loginAttemptRepository.save(record);
  }

  async reset(ip: string): Promise<void> {
    await this.loginAttemptRepository.delete({ ip });
  }
}