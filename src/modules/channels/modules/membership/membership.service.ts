import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { AddChannelMembersDto } from 'src/modules/channels/modules/membership/dto/add-channel-members.dto';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ChannelsMembershipService {
  constructor(
    @InjectRepository(ChannelMember)
    private channelMembersRepository: Repository<ChannelMember>,
  ) {}

  async create(channelId: string, userIds: string[]) {
    const members = userIds.map((userId: string) =>
      this.channelMembersRepository.create({ channelId, userId }),
    );
    return await this.channelMembersRepository.insert(members);
  }

  async createMultipleWithTransaction(
    { channelId, userIds }: AddChannelMembersDto,
    queryRunner: QueryRunner,
  ) {
    const members = userIds.map((userId: string) =>
      queryRunner.manager.create<ChannelMember>(ChannelMember, {
        channelId,
        userId,
      }),
    );

    return await queryRunner.manager.insert(ChannelMember, members);
  }

  async findAllUserChannels(userId: string) {
    const channelMemberships = await this.channelMembersRepository.find({
      where: { userId },
      relations: ['channel'],
      select: ['channel'],
    });
    return channelMemberships.map((membership) => membership.channel);
  }

  async findAllChannelMembers(channelId: string) {
    const channelMemberships = await this.channelMembersRepository.find({
      where: { channelId },
      relations: ['user'],
      select: ['user'],
    });
    return channelMemberships.map((membership) => membership.user);
  }

  async remove(userId: string) {
    return await this.channelMembersRepository.delete({ userId });
  }
}
