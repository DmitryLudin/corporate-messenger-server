import { IsArray } from 'class-validator';

export class AddChannelMembersDto {
  @IsArray()
  userIds: string[];
}
