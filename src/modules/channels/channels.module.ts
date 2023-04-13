import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { UserChannelStatus } from 'src/modules/channels/entities/member-message-status';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { ChannelMessage } from 'src/modules/channels/entities/message.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { ChannelCreationTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { UsersModule } from 'src/modules/users/users.module';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsUnreadService } from './services/unread.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([ChannelMember]),
    TypeOrmModule.forFeature([ChannelMessage]),
    TypeOrmModule.forFeature([UserChannelStatus]),
    UsersModule,
  ],
  providers: [
    ChannelCreationTransaction,
    ChannelsMembershipService,
    ChannelMessagesService,
    ChannelsUnreadService,
    ChannelsService,
    ChannelsGateway,
  ],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
