import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { UnreadChannelTimestampDto } from 'src/modules/channels/dto/unread-timestamp.dto';
import { UserChannelStatus } from 'src/modules/channels/entities/user-channel-status.entity';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { Repository } from 'typeorm';

@Injectable()
export class UnreadChannelsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(UserChannelStatus)
    private userChannelStatusRepository: Repository<UserChannelStatus>,
    private readonly messagesService: ChannelMessagesService,
  ) {}

  async markAsUnread(userId: string, channelId: string): Promise<void> {
    const lastReadKey = `channelLastRead:${userId}:${channelId}`;
    const lastReadTimestamp = await this.cacheManager.get<number>(lastReadKey);
    const lastMessage = await this.messagesService.findLastMessage(channelId);

    if (!lastReadTimestamp || lastMessage.timestamp > lastReadTimestamp) {
      // Помечаем канал как непрочитанный
      await this.cacheManager.set(`channelUnread:${userId}:${channelId}`, 1);
    }
  }

  async markAsRead({
    userId,
    channelId,
    timestamp,
  }: UnreadChannelTimestampDto): Promise<void> {
    // Сохраняем время последнего прочитанного сообщения
    const lastReadKey = `channelLastRead:${userId}:${channelId}`;
    await this.cacheManager.set(lastReadKey, timestamp);

    const lastMessage = await this.messagesService.findLastMessage(channelId);

    if (lastMessage?.timestamp === timestamp) {
      // Удаляем метку непрочитанного канала
      await this.cacheManager.del(`channelUnread:${userId}:${channelId}`);
    }
  }

  async isUnread(userId: string, channelId: string): Promise<boolean> {
    // Проверяем, есть ли метка непрочитанного сообщения
    const unreadKey = `channelUnread:${userId}:${channelId}`;
    const isUnread = await this.cacheManager.get<number>(unreadKey);

    if (isUnread === undefined) {
      const userChannelStatus = await this.userChannelStatusRepository.findOne({
        where: { userId, channelId },
      });

      return userChannelStatus?.isUnread || false;
    }

    return isUnread === 1;
  }

  async getLastReadTimestamp(userId: string, channelId: string) {
    const lastReadKey = `channelLastRead:${userId}:${channelId}`;
    const lastReadTimestamp = await this.cacheManager.get<number | undefined>(
      lastReadKey,
    );

    if (lastReadTimestamp) {
      return lastReadTimestamp;
    }

    const userChannelStatus = await this.userChannelStatusRepository.findOne({
      where: { userId, channelId },
    });

    return userChannelStatus.lastRead;
  }
}
