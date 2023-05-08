import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { ChannelCreationTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    private readonly createChannelTransaction: ChannelCreationTransaction,
    private readonly unreadChannelsService: UnreadChannelsService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.channelsRepository, options);
  }

  async findOne(id: string): Promise<Channel> {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async getChannelWithLastReadTimestamp(channelId: string, userId: string) {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
    });
    const lastRead = await this.unreadChannelsService.getLastRead(
      userId,
      channelId,
    );

    return {
      ...channel,
      lastRead,
    };
  }

  async create(data: CreateChannelWithMetaDto): Promise<Channel> {
    const channel = await this.createChannelTransaction.run(data);
    return this.findOne(channel.id);
  }

  async update(channelId: string, data: UpdateChannelDto): Promise<Channel> {
    await this.channelsRepository.update(channelId, data);
    return this.findOne(channelId);
  }

  async remove(id: string): Promise<void> {
    await this.channelsRepository.delete(id);
  }
}
