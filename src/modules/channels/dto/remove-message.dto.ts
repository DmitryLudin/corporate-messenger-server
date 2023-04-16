import { IsString } from 'class-validator';

export class RemoveChannelMessageDto {
  @IsString()
  id: string;

  @IsString()
  channelId: string;
}
