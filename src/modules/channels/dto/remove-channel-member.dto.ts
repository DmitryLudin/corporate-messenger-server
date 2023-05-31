import { IsString } from 'class-validator';

export class RemoveChannelMemberDto {
  @IsString()
  userId: string;
}

export class RemoveChannelMemberWithMetaDto extends RemoveChannelMemberDto {
  @IsString()
  channelId: string;
}
