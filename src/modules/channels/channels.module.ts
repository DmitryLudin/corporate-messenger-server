import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelMember } from 'src/modules/channels/entities/channel-member.entity';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelStatus } from 'src/modules/channels/entities/channel-status.entity';
import { ChannelsRepository } from 'src/modules/channels/repositories/channels.repository';
import { ChannelMembersService } from 'src/modules/channels/services/members.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { ChannelStatusesService } from 'src/modules/channels/services/statuses.service';
import { RemoveChannelMemberTransaction } from 'src/modules/channels/transactions';
import { AddChannelMembersTransaction } from 'src/modules/channels/transactions/add-members.transaction';
import { CreateChannelTransaction } from 'src/modules/channels/transactions/create-channel.transaction';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChannelMember,
      ChannelMessage,
      ChannelStatus,
    ]),
    AuthModule,
  ],
  providers: [
    ChannelsRepository,
    AddChannelMembersTransaction,
    RemoveChannelMemberTransaction,
    CreateChannelTransaction,
    ChannelStatusesService,
    ChannelMembersService,
    ChannelMessagesService,
    ChannelsService,
    ChannelsGateway,
  ],
  controllers: [ChannelsController],
  exports: [
    ChannelsService,
    CreateChannelTransaction,
    AddChannelMembersTransaction,
    ChannelsGateway,
  ],
})
export class ChannelsModule {}
