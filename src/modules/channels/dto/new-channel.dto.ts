import { IsArray, ValidateNested } from 'class-validator';
import { Channel } from 'src/modules/channels/entities/channel.entity';

export class NewChannelDto {
  @ValidateNested()
  channel: Channel;

  @IsArray()
  userIds: string[];
}
