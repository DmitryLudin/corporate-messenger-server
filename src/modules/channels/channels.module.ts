import { Module } from '@nestjs/common';
import { ChannelMembershipModule } from 'src/modules/channels/modules/membership/membership.module';
import { ChannelMessagesModule } from 'src/modules/channels/modules/messages/messages.module';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';

@Module({
  imports: [ChannelMembershipModule, ChannelMessagesModule],
  providers: [ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
