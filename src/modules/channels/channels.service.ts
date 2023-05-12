import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
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
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.channelsRepository, options);
  }

  async findOne(id: string, userId: string) {
    const channel = await this.channelsRepository.findOne({ where: { id } });

    if (!channel) {
      throw new HttpException(
        'Такого канала не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...channel,
      isUnread: await this.unreadChannelsService.isUnread(userId, id),
    };
  }

  async getByName(namespaceId: string, channelName: string, userId: string) {
    const channel = await this.channelsRepository.findOne({
      where: { namespaceId, name: channelName },
    });

    if (!channel) {
      throw new HttpException(
        'Канала с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    // const lastRead = await this.unreadChannelsService.getLastRead(
    //   userId,
    //   channel.id,
    // );

    return {
      ...channel,
      isUnread: await this.unreadChannelsService.isUnread(userId, channel.id),
      // lastReadTimestamp,
    };
  }

  async create(data: CreateChannelWithMetaDto): Promise<Channel> {
    const channel = await this.createChannelTransaction.run(data);
    return this.findOne(channel.id, data.userId);
  }

  async update(
    channelId: string,
    data: UpdateChannelDtoWithMeta,
  ): Promise<Channel> {
    await this.channelsRepository.update(channelId, data);
    return this.findOne(channelId, data.userId);
  }

  async remove(id: string): Promise<void> {
    await this.channelsRepository.delete(id);
  }
}
