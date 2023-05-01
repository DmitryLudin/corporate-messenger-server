import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { ChannelCreationTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { CreateNamespaceWithUserIdDto } from 'src/modules/namespaces/dto/create-namespace.dto';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { NamespaceMembersService } from 'src/modules/namespaces/services/members.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CreateNamespaceTransaction extends BaseTransaction<
  CreateNamespaceWithUserIdDto,
  Namespace
> {
  constructor(
    dataSource: DataSource,
    private readonly namespaceMembersService: NamespaceMembersService,
    private readonly channelCreationTransaction: ChannelCreationTransaction,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, ...other }: CreateNamespaceWithUserIdDto,
    manager: EntityManager,
  ): Promise<Namespace> {
    const namespace = await manager.save<Namespace>(
      manager.create<Namespace>(Namespace, other),
    );

    try {
      await Promise.all([
        this.namespaceMembersService.create(namespace.id, userId, manager),
        this.channelCreationTransaction.runWithinTransaction(
          {
            userId,
            members: [userId],
            namespaceId: namespace.id,
            name: 'general',
            displayName: 'general',
          },
          manager,
        ),
      ]);
    } catch (error) {
      console.log(error);
    }

    return namespace;
  }
}
