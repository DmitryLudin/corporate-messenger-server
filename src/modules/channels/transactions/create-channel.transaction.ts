import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class CreateChannelTransaction extends BaseTransaction<
  CreateChannelDto,
  Channel
> {
  constructor(
    dataSource: DataSource,
    private readonly channelsMembershipService: ChannelsMembershipService,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userId, members, ...others }: CreateChannelDto,
    manager: EntityManager,
  ): Promise<Channel> {
    const channel = manager.create<Channel>(Channel, others);
    let userIds = [userId];

    if (members && members.length > 0) {
      userIds = userIds.concat(members);
    }

    await Promise.all([
      this.channelsMembershipService.createMultipleWithTransaction(
        { channelId: channel.id, userIds },
        manager,
      ),
      manager.insert(Channel, channel),
    ]);

    return channel;
  }
}
