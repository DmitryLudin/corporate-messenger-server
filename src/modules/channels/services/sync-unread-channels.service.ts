import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { UserChannelStatus } from 'src/modules/channels/entities/user-channel-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SyncUnreadChannelsService {
  constructor(
    @InjectRepository(UserChannelStatus)
    private userChannelStatusRepository: Repository<UserChannelStatus>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Cron('0 0 * * * *') // Cron-выражение для запуска каждый час
  async syncUnreadMessages() {
    // Получаем все непрочитанные каналы из Redis
    const redisClient = this.cacheManager.store;
    const keys = await redisClient.keys('channelUnread:*:*');
    const results = (await redisClient.mget(...keys)) as number[];

    // Синхронизируем непрочитанные сообщения с базой данных
    const allChannelsStatuses = [];

    for (let i = 0; i < keys.length; i++) {
      const userId = keys[i].split(':')[1];
      const channelId = keys[i].split(':')[2];
      const isUnreadChannelCache = results[i] === 1;
      const lastRead = await redisClient.get<number | undefined>(
        `channelLastRead:${userId}:${channelId}`,
      );
      const userChannelStatus = await this.userChannelStatusRepository.findOne({
        where: { userId, channelId },
      });

      if (isUnreadChannelCache && !userChannelStatus) {
        allChannelsStatuses.push(
          this.userChannelStatusRepository.create({
            userId,
            channelId,
            isUnread: isUnreadChannelCache,
            lastRead,
          }),
        );
      } else if (!isUnreadChannelCache && userChannelStatus) {
        await Promise.all([
          this.userChannelStatusRepository.remove(userChannelStatus),
          this.cacheManager.del(`channelUnread:${userId}:${channelId}`),
          this.cacheManager.del(`channelLastRead:${userId}:${channelId}`),
        ]);
      } else if (isUnreadChannelCache && userChannelStatus) {
        userChannelStatus.isUnread = isUnreadChannelCache;
        userChannelStatus.lastRead = lastRead;
        allChannelsStatuses.push(userChannelStatus);
      }
    }

    await this.userChannelStatusRepository.save(allChannelsStatuses);
  }
}
