import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginateRaw } from 'nestjs-typeorm-paginate';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';
import { UpdateChannelDtoWithMeta } from 'src/modules/channels/dto';
import { Channel } from 'src/modules/channels/entities';
import { ChannelModel } from 'src/modules/channels/models';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  async findById(id: string): Promise<Channel | null> {
    return await this.channelsRepository.findOne({ where: { id } });
  }

  async findByName(options: {
    name: string;
    namespaceId: string;
  }): Promise<Channel | null> {
    return await this.channelsRepository.findOne({ where: options });
  }

  async findUserChannelIds(userId: string, namespaceId: string) {
    return await this.channelsRepository.find({
      where: { namespaceId, members: { userId } },
      select: { id: true },
    });
  }

  async getChannels(
    { namespaceId, userId }: { namespaceId: string; userId: string },
    options: IPaginationOptions,
  ): Promise<Pagination<ChannelModel>> {
    const queryBuilder = this.createChannelQueryBuilder(namespaceId, userId);
    this.addGroupingForChannelQueryBuilder(queryBuilder);
    const channelPaginationRaw = await paginateRaw(queryBuilder, options);

    return new Pagination<ChannelModel>(
      channelPaginationRaw.items.map((channel) => new ChannelModel(channel)),
      channelPaginationRaw.meta,
    );
  }

  async getAllUserChannels({
    userId,
    namespaceId,
  }: {
    userId: string;
    namespaceId: string;
  }): Promise<ChannelModel[]> {
    const queryBuilder = this.createChannelQueryBuilder(
      namespaceId,
      userId,
    ).andWhere('member.userId = :userId', { userId });
    this.addGroupingForChannelQueryBuilder(queryBuilder);

    const channelsRaw = await queryBuilder.getRawMany();
    return channelsRaw.map((channel) => new ChannelModel(channel));
  }

  async getByName(namespaceId: string, channelName: string, userId: string) {
    const queryBuilder = this.createChannelQueryBuilder(
      namespaceId,
      userId,
    ).andWhere('channel.name = :channelName', { channelName });
    this.addGroupingForChannelQueryBuilder(queryBuilder);

    const channelRaw = await queryBuilder.getRawOne();

    if (!channelRaw) {
      throw new HttpException(
        'Канала с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return new ChannelModel(channelRaw);
  }

  async getById(
    channelId: string,
    { namespaceId, userId }: { namespaceId: string; userId: string },
  ) {
    const queryBuilder = this.createChannelQueryBuilder(
      namespaceId,
      userId,
    ).andWhere('channel.id = :channelId', { channelId });
    this.addGroupingForChannelQueryBuilder(queryBuilder);

    const channelRaw = await queryBuilder.getRawOne();

    if (!channelRaw) {
      throw new HttpException(
        'Канала с таким ID не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return new ChannelModel(channelRaw);
  }

  async update(channelId: string, data: UpdateChannelDtoWithMeta) {
    return this.channelsRepository.update(channelId, data);
  }

  async incrementMembersCount(channelId: string) {
    return this.channelsRepository.increment(
      { id: channelId },
      'membersCount',
      1,
    );
  }

  async decrementMembersCount(channelId: string) {
    return this.channelsRepository.decrement(
      { id: channelId },
      'membersCount',
      1,
    );
  }

  private createChannelQueryBuilder(namespaceId: string, userId: string) {
    return this.channelsRepository
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

  private addGroupingForChannelQueryBuilder(
    queryBuilder: SelectQueryBuilder<Channel>,
  ) {
    queryBuilder
      .groupBy('channel.id')
      .addGroupBy('member.userId')
      .addGroupBy('statuses.lastReadTimestamp')
      .addGroupBy('statuses.isUnread');
    return queryBuilder;
  }
}
