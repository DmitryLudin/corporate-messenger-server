import { IsNumber, IsString } from 'class-validator';

export class UnreadChannelTimestampDto {
  @IsString()
  channelId: string;

  @IsString()
  userId: string;

  @IsNumber()
  timestamp: number;
}
