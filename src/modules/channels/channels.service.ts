import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDtoWithMeta } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
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
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  async findAll(namespaceId: string, options: IPaginationOptions) {
    return paginate(this.channelsRepository, options, {
      where: { namespaceId },
    });
  }

  async findById(id: string, userId: string) {
    const channel = await this.channelsRepository.findOne({ where: { id } });

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
    const channel = await this.channelsRepository.findOne({
      where: { namespaceId, name: channelName },
    });

    if (!channel) {
      throw new HttpException(
        'Канала с таким именем не существует',
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
