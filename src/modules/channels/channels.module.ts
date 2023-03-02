import { Module } from '@nestjs/common';
import { ChannelMembersModule } from 'src/modules/channels/modules/members/members.module';
import { ChannelMessagesModule } from 'src/modules/channels/modules/messages/messages.module';
import { ChannelsService } from './channels.service';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsController } from './channels.controller';

@Module({
  imports: [ChannelMembersModule, ChannelMessagesModule],
  providers: [ChannelsGateway, ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
