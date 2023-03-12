import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    private readonly channelMembersService: ChannelsMembershipService,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async create({ userId, ...others }: CreateChannelDto): Promise<Channel> {
    const channel = this.channelsRepository.create({ ...others });
    await this.channelMembersService.create({ userId, channelId: channel.id });
    await this.channelsRepository.insert(channel);
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
