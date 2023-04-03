import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelCreationTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    private readonly createChannelTransaction: ChannelCreationTransaction,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async create(data: CreateChannelDto): Promise<Channel> {
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
