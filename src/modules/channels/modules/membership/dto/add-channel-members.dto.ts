import { IsArray, IsString } from 'class-validator';

export class AddChannelMembersDto {
  @IsString()
  channelId: string;

  @IsArray()
  userIds: string[];
}
