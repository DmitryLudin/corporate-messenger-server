import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto';
import { Channel } from 'src/modules/channels/entities';
import { AddChannelMembersTransaction } from 'src/modules/channels/transactions/add-members.transaction';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CreateChannelTransaction extends BaseTransaction<
  CreateChannelWithMetaDto,
  Channel
> {
  constructor(
    dataSource: DataSource,
    private readonly addChannelMembersTransaction: AddChannelMembersTransaction,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, members, ...others }: CreateChannelWithMetaDto,
    manager: EntityManager,
  ): Promise<Channel> {
    let userIds = [userId];

    if (members?.length > 0) {
      userIds = userIds.concat(members);
    }

    const channel = await manager.save(
      manager.create<Channel>(Channel, {
        ...others,
        membersCount: 0,
      }),
    );

    await this.addChannelMembersTransaction.runWithinTransaction(
      { userIds, channelId: channel.id, namespaceId: others.namespaceId },
      manager,
    );

    return channel;
  }
}
