import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDtoWithMeta } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { CreateChannelTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    private readonly createChannelTransaction: CreateChannelTransaction,
    private readonly unreadChannelsService: UnreadChannelsService,
    private readonly channelsMembershipService: ChannelsMembershipService,
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

  async findAll(namespaceId: string, options: IPaginationOptions) {
    return paginate(this.channelsRepository, options, {
      where: { namespaceId },
    });
  }

  async findById(id: string, userId: string) {
    const channel = await this.getById(id);

    if (!channel) {
      throw new HttpException(
        'Такого канала не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    const lastReadTimestamp =
      await this.unreadChannelsService.getLastReadTimestamp(userId, channel.id);

    return {
      ...channel,
      lastReadTimestamp,
    };
  }

  async findByName(namespaceId: string, channelName: string, userId: string) {
    const channel = await this.getByName({ name: channelName, namespaceId });

    if (!channel) {
      throw new HttpException(
        'Канала с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    const [lastReadTimestamp, members] = await Promise.all([
      this.unreadChannelsService.getLastReadTimestamp(userId, channel.id),
      this.channelsMembershipService.findAllChannelMembership(channel.id),
    ]);

    return {
      ...channel,
      lastReadTimestamp,
      membersCount: members?.length || 0,
    };
  }

  async create(data: CreateChannelWithMetaDto): Promise<Channel> {
    const channel = await this.createChannelTransaction.run(data);
    return this.findById(channel.id, data.userId);
  }

  async update(
    channelId: string,
    data: UpdateChannelDtoWithMeta,
  ): Promise<Channel> {
    await this.channelsRepository.update(channelId, data);
    return this.findById(channelId, data.userId);
  }
}
