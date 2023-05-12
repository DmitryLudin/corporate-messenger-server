import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CreateChannelTransaction extends BaseTransaction<
  CreateChannelWithMetaDto,
  Channel
> {
  constructor(
    dataSource: DataSource,
    private readonly channelsMembershipService: ChannelsMembershipService,
    private unreadChannelsService: UnreadChannelsService,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, members, ...others }: CreateChannelWithMetaDto,
    manager: EntityManager,
  ): Promise<Channel> {
    const channel = await manager.save(
      manager.create<Channel>(Channel, others),
    );
    let userIds = [userId];

    if (members?.length > 0) {
      userIds = userIds.concat(members);
    }

    await Promise.all([
      this.channelsMembershipService.addMembers(
        channel.id,
        { userIds, namespaceId: others.namespaceId },
        manager,
      ),
      this.unreadChannelsService.markAsRead({
        userId,
        channelId: channel.id,
        timestamp: channel.createdAt.getTime(),
      }),
    ]);

    return channel;
  }
}
