// src/modules/auth/login-attempt.service.ts
import { Injectable} from '@nestjs/common';

interface AttemptRecord {
  count: number;
  blockedUntil: Date | null;
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

@Injectable()
export class LoginAttemptService {
  private readonly attempts = new Map<string, AttemptRecord>();

  isBlocked(ip: string): boolean {
    const record = this.attempts.get(ip);
    if (!record?.blockedUntil) return false;

    if (new Date() < record.blockedUntil) {
      return true;
    }

    // El bloqueo expiró — lo limpiamos
    this.attempts.delete(ip);
    return false;
  }

  registerFailure(ip: string): void {
    const record = this.attempts.get(ip) ?? { count: 0, blockedUntil: null };
    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
    }

    this.attempts.set(ip, record);
  }

  reset(ip: string): void {
    this.attempts.delete(ip);
  }
}