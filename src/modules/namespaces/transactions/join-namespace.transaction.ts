import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { JoinNamespaceTransactionDto } from 'src/modules/namespaces/dto/join-namespace.dto';
import { NamespaceMembersService } from 'src/modules/namespaces/services/members.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class JoinNamespaceTransaction extends BaseTransaction<
  JoinNamespaceTransactionDto,
  void
> {
  constructor(
    dataSource: DataSource,
    private readonly namespaceMembersService: NamespaceMembersService,
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly channelsService: ChannelsService,
    private readonly channelsGateway: ChannelsGateway,
    private unreadChannelsService: UnreadChannelsService,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, namespaceId }: JoinNamespaceTransactionDto,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const channel = await this.channelsService.getByName({
        name: 'general',
        namespaceId,
      });

      await Promise.all([
        this.namespaceMembersService.addMember(namespaceId, userId, manager),
        this.channelsMembershipService.addMembers(
          channel.id,
          {
            userIds: [userId],
            namespaceId,
          },
          manager,
        ),
        this.unreadChannelsService.markAsRead({
          userId,
          channelId: channel.id,
          timestamp: channel.createdAt.getTime(),
        }),
      ]);

      return this.channelsGateway.emitNewChannelMembers(channel.id);
    } catch (error) {
      console.log(error);
    }
  }
}
