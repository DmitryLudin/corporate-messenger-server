import { Injectable } from '@nestjs/common';
import { AddChannelMemberDto } from 'src/modules/channels/modules/members/dto/add-channel-member.dto';
import { UpdateChannelMemberDto } from 'src/modules/channels/modules/members/dto/update-member.dto';

@Injectable()
export class ChannelMembersService {
  create(createChannelsMemberDto: AddChannelMemberDto) {
    return 'This action adds a new channelsMember';
  }

  findAll() {
    return `This action returns all channelsMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channelsMember`;
  }

  update(id: number, updateChannelsMemberDto: UpdateChannelMemberDto) {
    return `This action updates a #${id} channelsMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} channelsMember`;
  }
}
