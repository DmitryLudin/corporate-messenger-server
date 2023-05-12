import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
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
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, namespaceId }: JoinNamespaceTransactionDto,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const channel = await this.channelsService.findByName(
        namespaceId,
        'general',
        userId,
      );

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
      ]);

      return this.channelsGateway.emitNewChannelMembers(channel.id, {
        userIds: [userId],
      });
    } catch (error) {
      console.log(error);
    }
  }
}
