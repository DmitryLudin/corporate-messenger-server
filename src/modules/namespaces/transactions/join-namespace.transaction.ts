import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { AddChannelMembersTransaction } from 'src/modules/channels/transactions/add-members.transaction';
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
    private readonly addChannelMembersTransaction: AddChannelMembersTransaction,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, namespaceId, channelId }: JoinNamespaceTransactionDto,
    manager: EntityManager,
  ): Promise<void> {
    try {
      await Promise.all([
        this.namespaceMembersService.addMember(namespaceId, userId, manager),
        this.addChannelMembersTransaction.runWithinTransaction(
          { channelId, namespaceId, userIds: [userId] },
          manager,
        ),
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
