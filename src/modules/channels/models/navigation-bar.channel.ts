import { IsBoolean } from 'class-validator';
import { Channel } from 'src/modules/channels/entities/channel.entity';

export class NavigationBarChannel extends Channel {
  @IsBoolean()
  isUnread: boolean;

  constructor(partial: Partial<NavigationBarChannel>) {
    super();
    Object.assign(this, partial);
  }
}
