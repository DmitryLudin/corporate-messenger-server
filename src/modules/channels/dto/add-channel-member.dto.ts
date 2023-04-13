import { IsString } from 'class-validator';

export class AddChannelMemberDto {
  @IsString()
  channelId: string;

  @IsString()
  userId: string;
}
