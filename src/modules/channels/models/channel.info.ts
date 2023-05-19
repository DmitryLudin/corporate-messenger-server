import { IsNumber } from 'class-validator';
import { Channel } from 'src/modules/channels/entities/channel.entity';

export class ChannelInfo extends Channel {
  @IsNumber()
  lastReadTimestamp: number;

  @IsNumber()
  membersCount: number;

  constructor(partial: Partial<ChannelInfo>) {
    super();
    Object.assign(this, partial);
  }
}
