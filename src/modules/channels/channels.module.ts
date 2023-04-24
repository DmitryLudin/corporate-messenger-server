import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelMember } from 'src/modules/channels/entities/channel-member.entity';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UserChannelStatus } from 'src/modules/channels/entities/user-channel-status';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { SyncUnreadChannelsService } from 'src/modules/channels/services/sync-unread-channels.service';
import { ChannelCreationTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { UsersModule } from 'src/modules/users/users.module';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([ChannelMember]),
    TypeOrmModule.forFeature([ChannelMessage]),
    TypeOrmModule.forFeature([UserChannelStatus]),
    UsersModule,
    AuthModule,
  ],
  providers: [
    SyncUnreadChannelsService,
    ChannelCreationTransaction,
    ChannelsMembershipService,
    ChannelMessagesService,
    UnreadChannelsService,
    ChannelsService,
    ChannelsGateway,
  ],
  controllers: [ChannelsController],
  exports: [ChannelsService, ChannelCreationTransaction],
})
export class ChannelsModule {}
