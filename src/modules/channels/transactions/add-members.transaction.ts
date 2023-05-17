import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { AddChannelMembersTransactionDto } from 'src/modules/channels/dto/add-channel-members.dto';
import { ChannelMembersService } from 'src/modules/channels/services/members.service';
import { ChannelStatusesService } from 'src/modules/channels/services/statuses.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class AddChannelMembersTransaction extends BaseTransaction<
  AddChannelMembersTransactionDto,
  void
> {
  constructor(
    dataSource: DataSource,
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
      this.channelStatusesService.createStatuses(channelId, userIds, manager),
    ]);
  }
}
