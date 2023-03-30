import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async create({
    userId,
    members,
    ...others
  }: CreateChannelDto): Promise<Channel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const channel = queryRunner.manager.create<Channel>(Channel, others);
      let userIds = [userId];

      if (members && members.length > 0) {
        userIds = userIds.concat(members);
      }

      await Promise.all([
        this.channelsMembershipService.createMultipleWithTransaction(
          { channelId: channel.id, userIds },
          queryRunner,
        ),
        queryRunner.manager.insert(Channel, channel),
      ]);

      await queryRunner.commitTransaction();

      return this.findOne(channel.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async update(channelId: string, data: UpdateChannelDto): Promise<Channel> {
    await this.channelsRepository.update(channelId, data);
    return this.findOne(channelId);
  }

  async remove(id: string): Promise<void> {
    await this.channelsRepository.delete(id);
  }
}
