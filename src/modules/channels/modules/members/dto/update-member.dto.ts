import { PartialType } from '@nestjs/mapped-types';
import { AddChannelMemberDto } from 'src/modules/channels/modules/members/dto/add-channel-member.dto';

export class UpdateChannelMemberDto extends PartialType(AddChannelMemberDto) {
  id: number;
}
