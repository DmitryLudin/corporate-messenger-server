import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDtoWithMeta } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { CreateChannelTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    private readonly createChannelTransaction: CreateChannelTransaction,
  ) {}

  async getById(id: string): Promise<Channel | null> {
    return await this.channelsRepository.findOne({ where: { id } });
  }

  async getByName(options: {
    name: string;
    namespaceId: string;
  }): Promise<Channel | null> {
    return await this.channelsRepository.findOne({ where: options });
  }

  async getUserChannelIds(userId: string, namespaceId: string) {
    return await this.channelsRepository.find({
      where: { namespaceId, members: { userId } },
      select: { id: true },
    });
  }

  async findAll(namespaceId: string, options: IPaginationOptions) {
    return paginate(this.channelsRepository, options, {
      where: { namespaceId },
    });
  }

  async findAllUserChannels({
    userId,
    namespaceId,
  }: {
    userId: string;
    namespaceId: string;
  }) {
    const channels = await this.channelsRepository.find({
      relations: { statuses: true },
      where: { namespaceId, members: { userId }, statuses: { userId } },
      select: { statuses: { isUnread: true } },
    });

    return channels.map((channel) => {
      channel.isUnread = channel.statuses[0]?.isUnread || false;
      return channel;
    });
  }

  async findByName(namespaceId: string, channelName: string, userId: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoin('channel.members', 'members')
      .leftJoin('channel.statuses', 'statuses', 'statuses.userId = :userId', {
        userId,
      })
      .select('channel.*')
      .addSelect('COUNT(members)::int', 'membersCount')
      .addSelect('statuses.lastReadTimestamp', 'lastReadTimestamp')
      .where('channel.name = :channelName', { channelName })
      .andWhere('channel.namespaceId = :namespaceId', {
        namespaceId,
      })
      .groupBy('channel.id')
      .addGroupBy('statuses.lastReadTimestamp')
      .getRawOne();

    if (!channel) {
      throw new HttpException(
        'Канала с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return channel;
  }

  async findById(id: string, userId: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoin('channel.members', 'members')
      .leftJoin('channel.statuses', 'statuses', 'statuses.userId = :userId', {
        userId,
      })
      .select('channel.*')
      .addSelect('COUNT(members)::int', 'membersCount')
      .addSelect('statuses.lastReadTimestamp', 'lastReadTimestamp')
      .where('channel.id = :channelId', { channelId: id })
      .groupBy('channel.id')
      .addGroupBy('statuses.lastReadTimestamp')
      .getRawOne();

    if (!channel) {
      throw new HttpException(
        'Канала с таким ID не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return channel;
  }

  async create(data: CreateChannelWithMetaDto): Promise<Channel> {
    return await this.createChannelTransaction.run(data);
  }

  async update(
    channelId: string,
    data: UpdateChannelDtoWithMeta,
  ): Promise<Channel> {
    await this.channelsRepository.update(channelId, data);
    return this.findById(channelId, data.userId);
  }
}
