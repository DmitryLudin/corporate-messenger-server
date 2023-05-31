import { Injectable } from '@nestjs/common';
import { BaseTransaction } from 'src/core/base-transaction';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { RemoveChannelMemberWithMetaDto } from 'src/modules/channels/dto';
import {
  ChannelMembersService,
  ChannelStatusesService,
} from 'src/modules/channels/services';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class RemoveChannelMemberTransaction extends BaseTransaction<
  RemoveChannelMemberWithMetaDto,
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
    { channelId, userId }: RemoveChannelMemberWithMetaDto,
    manager: EntityManager,
  ) {
    await Promise.all([
      this.channelMembersService.removeMember(channelId, userId, manager),
      this.channelStatusesService.removeStatus(channelId, userId, manager),
      this.channelsService.decrementMembersCount(channelId),
    ]);
  }
}
