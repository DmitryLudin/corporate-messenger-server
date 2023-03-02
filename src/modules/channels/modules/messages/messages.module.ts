import { Module } from '@nestjs/common';
import { ChannelMessagesGateway } from 'src/modules/channels/modules/messages/messages.gateway';
import { ChannelMessagesService } from 'src/modules/channels/modules/messages/messages.service';

@Module({
  providers: [ChannelMessagesService, ChannelMessagesGateway],
})
export class ChannelMessagesModule {}
