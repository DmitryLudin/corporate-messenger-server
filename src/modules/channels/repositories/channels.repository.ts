import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginateRaw } from 'nestjs-typeorm-paginate';
import { UpdateChannelDtoWithMeta } from 'src/modules/channels/dto';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

import { Channel } from '../entities';

@Injectable()
export class ChannelsRepository {
  constructor(
    @InjectRepository(Channel)
    private repository: Repository<Channel>,
  ) {}

  async findById(id: string): Promise<Channel | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(options: { name: string; namespaceId: string }) {
    return this.repository.findOne({ where: options });
  }

  async findUserChannelIds(userId: string, namespaceId: string) {
    return this.repository.find({
      where: { namespaceId, members: { userId } },
      select: { id: true },
    });
  }

  async findWithUserDetails(
    {
      namespaceId,
      userId,
    }: {
      namespaceId: string;
      userId: string;
    },
    options: IPaginationOptions,
  ) {
    const queryBuilder = this.createChannelQueryBuilder(namespaceId, userId);
    this.groupByFields(queryBuilder);
    return paginateRaw(queryBuilder, options);
  }

  async findUserChannelsWithDetails({
    userId,
    namespaceId,
  }: {
    userId: string;
    namespaceId: string;
  }) {
    const queryBuilder = this.createChannelQueryBuilder(namespaceId, userId);
    queryBuilder.andWhere('member.userId = :userId', { userId });
    this.groupByFields(queryBuilder);
    return queryBuilder.getRawMany();
  }

  async findByNameWithUserDetails(
    namespaceId: string,
    channelName: string,
    userId: string,
  ) {
    const queryBuilder = this.createChannelQueryBuilder(namespaceId, userId);
    queryBuilder.andWhere('channel.name = :channelName', { channelName });
    this.groupByFields(queryBuilder);
    return queryBuilder.getRawOne();
  }

  async findByIdWithUserDetails(
    channelId: string,
    { namespaceId, userId }: { namespaceId: string; userId: string },
  ) {
    const queryBuilder = this.createChannelQueryBuilder(namespaceId, userId);
    queryBuilder.andWhere('channel.id = :channelId', { channelId });
    this.groupByFields(queryBuilder);

    return queryBuilder.getRawOne();
  }

  async update(channelId: string, data: UpdateChannelDtoWithMeta) {
    return this.repository.update(channelId, data);
  }

  async incrementMembersCount(
    channelId: string,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    return repository.increment({ id: channelId }, 'membersCount', 1);
  }

  async decrementMembersCount(
    channelId: string,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    return repository.decrement({ id: channelId }, 'membersCount', 1);
  }

  private createChannelQueryBuilder(namespaceId: string, userId: string) {
    return this.repository
      .createQueryBuilder('channel')
      .leftJoin(
        'channel.members',
        'member',
        'member.userId = :userId AND member.namespaceId = :namespaceId',
        {
          userId,
          namespaceId,
        },
      )
      .leftJoin(
        'channel.statuses',
        'statuses',
        'statuses.userId = :userId AND statuses.namespaceId = :namespaceId',
        {
          userId,
          namespaceId,
        },
      )
      .select('channel.*')
      .addSelect(
        'CASE WHEN member.userId IS NOT NULL THEN true ELSE false END',
        'isMember',
      )
      .addSelect('statuses.lastReadTimestamp', 'lastReadTimestamp')
      .addSelect('statuses.isUnread', 'isUnread')
      .where('channel.namespaceId = :namespaceId', { namespaceId });
  }

  private groupByFields(queryBuilder: SelectQueryBuilder<Channel>) {
    queryBuilder
      .groupBy('channel.id')
      .addGroupBy('member.userId')
      .addGroupBy('statuses.lastReadTimestamp')
      .addGroupBy('statuses.isUnread');
    return queryBuilder;
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(Channel)
      : this.repository;
  }
}
