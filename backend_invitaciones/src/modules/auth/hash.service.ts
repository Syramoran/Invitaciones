import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  async hash(plain: string): Promise<string> {
    return await argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return await argon2.verify(hash, plain);
  }
}