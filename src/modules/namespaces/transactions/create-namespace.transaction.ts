import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateNamespaceDto } from 'src/modules/namespaces/dto/create-namespace.dto';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { NamespaceMembersService } from 'src/modules/namespaces/services/members.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CreateNamespaceTransaction extends BaseTransaction<
  CreateNamespaceDto,
  Namespace
> {
  constructor(
    dataSource: DataSource,
    private readonly namespaceMembersService: NamespaceMembersService,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, ...other }: CreateNamespaceDto,
    manager: EntityManager,
  ): Promise<Namespace> {
    const namespace = manager.create<Namespace>(Namespace, other);

    await Promise.all([
      this.namespaceMembersService.create(namespace.id, userId, manager),
      manager.insert(Namespace, namespace),
    ]);

    return namespace;
  }
}
