import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { AddChannelMemberDto } from 'src/modules/channels/modules/members/dto/add-channel-member.dto';
import { UpdateChannelMemberDto } from 'src/modules/channels/modules/members/dto/update-member.dto';
import { ChannelMembersService } from 'src/modules/channels/modules/members/members.service';

@WebSocketGateway()
export class ChannelMembersGateway {
  constructor(private readonly channelsMembersService: ChannelMembersService) {}

  @SubscribeMessage('createChannelsMember')
  create(@MessageBody() createChannelsMemberDto: AddChannelMemberDto) {
    return this.channelsMembersService.create(createChannelsMemberDto);
  }

  @SubscribeMessage('findAllChannelsMembers')
  findAll() {
    return this.channelsMembersService.findAll();
  }

  @SubscribeMessage('findOneChannelsMember')
  findOne(@MessageBody() id: number) {
    return this.channelsMembersService.findOne(id);
  }

  @SubscribeMessage('updateChannelsMember')
  update(@MessageBody() updateChannelsMemberDto: UpdateChannelMemberDto) {
    return this.channelsMembersService.update(
      updateChannelsMemberDto.id,
      updateChannelsMemberDto,
    );
  }

  @SubscribeMessage('removeChannelsMember')
  remove(@MessageBody() id: number) {
    return this.channelsMembersService.remove(id);
  }
}
