import { IsArray, IsString } from 'class-validator';

export class AddChannelMembersDto {
  @IsArray()
  userIds: string[];
}

export class AddChannelMembersWithNamespaceDto extends AddChannelMembersDto {
  @IsString()
  namespaceId: string;
}
