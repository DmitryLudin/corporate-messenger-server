import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddChannelMembersDto } from 'src/modules/channels/dto/add-channel-members.dto';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ChannelsMembershipService {
  constructor(
    @InjectRepository(ChannelMember)
    private channelMembersRepository: Repository<ChannelMember>,
    private readonly unreadChannelsService: UnreadChannelsService,
  ) {}

  async createMultiple(
    channelId: string,
    { userIds }: AddChannelMembersDto,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);

    const members = userIds.map((userId: string) =>
      repository.create({ channelId, userId }),
    );

    return await repository.insert(members);
  }

  async findAllUserChannels(userId: string) {
    const channelsMembership = await this.channelMembersRepository.find({
      where: { userId },
      relations: ['channel'],
      select: ['channel'],
    });

    return channelsMembership.map((membership) => ({
      ...membership.channel,
      isUnread: this.unreadChannelsService.isUnread(
        userId,
        membership.channelId,
      ),
    }));
  }

  async findAllChannelMembers(channelId: string) {
    const channelsMembership = await this.channelMembersRepository.find({
      where: { channelId },
      relations: ['user'],
      select: ['user'],
    });

    return channelsMembership.map((membership) => membership.user);
  }

  async remove(channelId: string, userId: string) {
    return await this.channelMembersRepository.delete({ userId, channelId });
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(ChannelMember)
      : this.channelMembersRepository;
  }
}