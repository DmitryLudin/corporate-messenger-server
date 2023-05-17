import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelStatus } from 'src/modules/channels/entities/channel-status.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ChannelStatusesService {
  constructor(
    @InjectRepository(ChannelStatus)
    private channelStatusesRepository: Repository<ChannelStatus>,
  ) {}

  async createStatuses(
    channelId: string,
    userIds: string[],
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    const lastReadTimestamp = new Date().getTime();

    const statuses = userIds.map((userId: string) => {
      return repository.create({
        channelId,
        userId,
        lastReadTimestamp,
        isUnread: true,
      });
    });

    return repository.insert(statuses);
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(ChannelStatus)
      : this.channelStatusesRepository;
  }
}
