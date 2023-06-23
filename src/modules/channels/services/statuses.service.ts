import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddChannelMembersWithNamespaceDto } from 'src/modules/channels/dto';
import { ChannelStatus } from 'src/modules/channels/entities';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ChannelStatusesService {
  constructor(
    @InjectRepository(ChannelStatus)
    private channelStatusesRepository: Repository<ChannelStatus>,
  ) {}

  async createStatuses(
    channelId: string,
    { userIds, namespaceId }: AddChannelMembersWithNamespaceDto,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    const lastReadTimestamp = new Date().getTime();

    const statuses = userIds.map((userId: string) => {
      return repository.create({
        channelId,
        userId,
        namespaceId,
        lastReadTimestamp,
        isUnread: false,
      });
    });

    return repository.insert(statuses);
  }

  async removeStatus(
    channelId: string,
    userId: string,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    return repository.delete({ userId, channelId });
  }

  async update(
    channelId: string,
    userId: string,
    data: Partial<ChannelStatus>,
  ) {
    return this.channelStatusesRepository.update({ channelId, userId }, data);
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(ChannelStatus)
      : this.channelStatusesRepository;
  }
}
