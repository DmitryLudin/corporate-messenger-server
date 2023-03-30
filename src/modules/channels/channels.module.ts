import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipModule } from 'src/modules/channels/modules/membership/membership.module';
import { ChannelMessagesModule } from 'src/modules/channels/modules/messages/messages.module';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    ChannelsMembershipModule,
    ChannelMessagesModule,
  ],
  providers: [ChannelsService, ChannelsGateway],
  controllers: [ChannelsController],
})
export class ChannelsModule {}