import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTransaction } from 'src/core/base-transaction';
import { CreateChannelWithMetaDto } from 'src/modules/channels/dto/create-channel.dto';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UserChannelStatus } from 'src/modules/channels/entities/user-channel-status.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class CreateChannelTransaction extends BaseTransaction<
  CreateChannelWithMetaDto,
  Channel
> {
  constructor(
    dataSource: DataSource,
    private readonly channelsMembershipService: ChannelsMembershipService,
    @InjectRepository(UserChannelStatus)
    private userChannelStatusRepository: Repository<UserChannelStatus>,
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
    ]);

    return channel;
  }
}
