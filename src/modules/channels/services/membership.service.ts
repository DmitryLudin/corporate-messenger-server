import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import {
  AddChannelMembersDto,
  AddChannelMembersWithNamespaceDto,
} from 'src/modules/channels/dto/add-channel-members.dto';
import { ChannelMember } from 'src/modules/channels/entities/channel-member.entity';
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
    { userIds, namespaceId }: AddChannelMembersWithNamespaceDto,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);

    const members = userIds.map((userId: string) =>
      repository.create({ channelId, userId, namespaceId }),
    );

    return await repository.insert(members);
  }

  async findAllUserChannels(userId: string, namespaceId: string) {
    const channelsMembership = await this.channelMembersRepository.find({
      where: { userId, namespaceId },
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

  async findAllChannelMembership(channelId: string) {
    return await this.channelMembersRepository.find({
      where: { channelId },
      relations: ['user'],
      select: ['user'],
    });
  }

  async findAllChannelMembers(channelId: string, options: IPaginationOptions) {
    const channelsMembership = await paginate(
      this.channelMembersRepository,
      options,
      {
        where: { channelId },
        relations: ['user'],
        select: ['user'],
      },
    );

    return {
      ...channelsMembership,
      items: channelsMembership.items.map((membership) => membership.user),
    };
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
