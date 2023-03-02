import { Module } from '@nestjs/common';
import { ChannelMembersController } from 'src/modules/channels/modules/members/members.controller';
import { ChannelMembersGateway } from 'src/modules/channels/modules/members/members.gateway';
import { ChannelMembersService } from 'src/modules/channels/modules/members/members.service';

@Module({
  providers: [ChannelMembersService, ChannelMembersGateway],
  controllers: [ChannelMembersController],
})
export class ChannelMembersModule {}
