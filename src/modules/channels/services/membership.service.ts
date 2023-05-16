import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { AddChannelMembersWithNamespaceDto } from 'src/modules/channels/dto/add-channel-members.dto';
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

  async addMembers(
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
    });

    return Promise.all(
      channelsMembership.map(async (membership) => {
        const isUnreadChannel = await this.unreadChannelsService.isUnread(
          userId,
          membership.channelId,
        );

        return {
          ...membership.channel,
          isUnread: isUnreadChannel,
        };
      }),
    );
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

  async removeMember(channelId: string, userId: string) {
    return await this.channelMembersRepository.delete({ userId, channelId });
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(ChannelMember)
      : this.channelMembersRepository;
  }
}
