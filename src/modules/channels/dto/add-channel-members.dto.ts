import { IsArray, IsString } from 'class-validator';

export class AddChannelMembersDto {
  @IsArray()
  userIds: string[];
}

export class AddChannelMembersWithNamespaceDto extends AddChannelMembersDto {
  @IsString()
  namespaceId: string;
}

export class AddChannelMembersTransactionDto extends AddChannelMembersWithNamespaceDto {
  @IsString()
  channelId: string;
}
