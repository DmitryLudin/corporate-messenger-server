import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
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
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, namespaceId }: JoinNamespaceTransactionDto,
    manager: EntityManager,
  ): Promise<void> {
    try {
      const channel = await this.channelsService.getByName(
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
            namespaceId: namespaceId,
          },
          manager,
        ),
      ]);
    } catch (error) {
      console.log(error);
    }
  }
}
