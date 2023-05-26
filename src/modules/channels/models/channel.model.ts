import { IsBoolean, IsNumber } from 'class-validator';
import { Channel } from 'src/modules/channels/entities';

export class ChannelModel extends Channel {
  @IsBoolean()
  isMember: boolean;

  @IsNumber()
  lastReadTimestamp: number;

  @IsBoolean()
  isUnread: boolean;

  constructor(partial: Partial<ChannelModel>) {
    super();
    Object.assign(this, partial);
  }
}
