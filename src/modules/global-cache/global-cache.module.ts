import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: 86400 * 1000, // Время кэша 1 сутки
        store: redisStore,
        url: `redis://${configService.get('REDIS_HOST')}:${configService.get(
          'REDIS_PORT',
        )}`,
      }),
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
