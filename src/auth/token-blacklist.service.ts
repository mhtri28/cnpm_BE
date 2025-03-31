import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from './entities/token-blacklist.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepository: Repository<TokenBlacklist>,
  ) {}

  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    const blacklistedToken = this.tokenBlacklistRepository.create({
      token,
      expiresAt,
    });
    await this.tokenBlacklistRepository.save(blacklistedToken);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });
    return !!blacklistedToken;
  }

  async removeExpiredTokens(): Promise<void> {
    await this.tokenBlacklistRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
