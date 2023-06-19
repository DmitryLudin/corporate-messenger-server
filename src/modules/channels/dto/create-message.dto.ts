import { IsString, MaxLength } from 'class-validator';

export class CreateChannelMessageDto {
  @IsString()
  @MaxLength(5000)
  text: string;

  @IsString()
  channelId: string;

  @IsString()
  userId: string;

  @IsString()
  namespaceId: string;
}
