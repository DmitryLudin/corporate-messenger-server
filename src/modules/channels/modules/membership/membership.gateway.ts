import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { AddChannelMemberDto } from 'src/modules/channels/modules/membership/dto/add-channel-member.dto';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

@WebSocketGateway()
export class ChannelsMembershipGateway {
  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
  ) {}

  @SubscribeMessage('createChannelsMember')
  create(@MessageBody() createChannelsMemberDto: AddChannelMemberDto) {
    return this.channelsMembershipService.create(createChannelsMemberDto);
  }

  @SubscribeMessage('findAllChannelsMembers')
  findAll(@MessageBody() id: string) {
    return this.channelsMembershipService.findAll(id);
  }

  @SubscribeMessage('removeChannelsMember')
  remove(@MessageBody() id: string) {
    return this.channelsMembershipService.remove(id);
  }
}
