import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { AddChannelMembersTransactionDto } from 'src/modules/channels/dto';
import {
  ChannelMembersService,
  ChannelStatusesService,
} from 'src/modules/channels/services';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class AddChannelMembersTransaction extends BaseTransaction<
  AddChannelMembersTransactionDto,
  void
> {
  constructor(
    dataSource: DataSource,
    private readonly channelsService: ChannelsService,
    private readonly channelMembersService: ChannelMembersService,
    private readonly channelStatusesService: ChannelStatusesService,
  ) {
    super(dataSource);
  }

  protected async execute(
    { userIds, namespaceId, channelId }: AddChannelMembersTransactionDto,
    manager: EntityManager,
  ) {
    await Promise.all([
      this.channelMembersService.addMembers(
        channelId,
        { userIds, namespaceId },
        manager,
      ),
      this.channelStatusesService.createStatuses(
        channelId,
        { userIds, namespaceId },
        manager,
      ),
      this.channelsService.incrementMembersCount(channelId),
    ]);
  }
}
