import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { ChannelsMembershipController } from 'src/modules/channels/modules/membership/membership.controller';
import { ChannelsMembershipGateway } from 'src/modules/channels/modules/membership/membership.gateway';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMember])],
  providers: [ChannelsMembershipService, ChannelsMembershipGateway],
  controllers: [ChannelsMembershipController],
  exports: [ChannelsMembershipService],
})
export class ChannelsMembershipModule {}
