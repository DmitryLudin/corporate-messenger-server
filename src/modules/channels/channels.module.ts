import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelMember } from 'src/modules/channels/entities/channel-member.entity';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UserChannelStatus } from 'src/modules/channels/entities/user-channel-status.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { SyncUnreadChannelsService } from 'src/modules/channels/services/sync-unread-channels.service';
import { CreateChannelTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { UsersModule } from 'src/modules/users/users.module';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChannelMember,
      ChannelMessage,
      UserChannelStatus,
    ]),
    AuthModule,
    UsersModule,
  ],
  providers: [
    SyncUnreadChannelsService,
    CreateChannelTransaction,
    ChannelsMembershipService,
    ChannelMessagesService,
    UnreadChannelsService,
    ChannelsService,
    ChannelsGateway,
  ],
  controllers: [ChannelsController],
  exports: [
    ChannelsService,
    ChannelsMembershipService,
    CreateChannelTransaction,
    ChannelsGateway,
  ],
})
export class ChannelsModule {}
