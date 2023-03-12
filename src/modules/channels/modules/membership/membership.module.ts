import { Module } from '@nestjs/common';
import { ChannelsMembershipController } from 'src/modules/channels/modules/membership/membership.controller';
import { ChannelsMembershipGateway } from 'src/modules/channels/modules/membership/membership.gateway';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

@Module({
  providers: [ChannelsMembershipService, ChannelsMembershipGateway],
  controllers: [ChannelsMembershipController],
})
export class ChannelMembershipModule {}
