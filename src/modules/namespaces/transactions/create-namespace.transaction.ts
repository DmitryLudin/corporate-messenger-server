import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateChannelTransaction } from 'src/modules/channels';
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
    private readonly createChannelTransaction: CreateChannelTransaction,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, displayName, name }: CreateNamespaceWithUserIdDto,
    manager: EntityManager,
  ): Promise<Namespace> {
    const namespace = await manager.save<Namespace>(
      manager.create<Namespace>(Namespace, { displayName, name }),
    );

    try {
      await Promise.all([
        this.namespaceMembersService.addMember(namespace.id, userId, manager),
        this.createChannelTransaction.runWithinTransaction(
          {
            userId,
            namespaceId: namespace.id,
            name: 'general',
            displayName: 'general',
          },
          manager,
        ),
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }

    return namespace;
  }
}
