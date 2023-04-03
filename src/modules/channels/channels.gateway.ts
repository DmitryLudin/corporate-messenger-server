import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { cors } from 'src/const/cors';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChannelsEventEnum } from 'src/modules/channels/const/channels-event.enum';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

@WebSocketGateway({ cors, namespace: 'channels' })
export class ChannelsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const user = await this.authService.getUserFromSocket(client);
    const channels = await this.channelsMembershipService.findAllUserChannels(
      user.id,
    );
    channels.forEach((channel) => client.join(channel.id));
  }

  emitNewChannel(userIds: string[], channel: Channel) {
    this.server.to(userIds).emit(ChannelsEventEnum.NEW_CHANNEL, {
      channel: this.deserializeData(channel),
    });
  }

  emitUpdatedChannel(channel: Channel) {
    this.server.to(channel.id).emit(ChannelsEventEnum.CHANNEL_UPDATED, {
      channel: this.deserializeData(channel),
    });
  }

  emitRemovedChannel(channelId: string) {
    this.server
      .to(channelId)
      .emit(ChannelsEventEnum.CHANNEL_REMOVED, { channelId });
  }

  private deserializeData<T extends object>(data: T): T {
    return instanceToPlain(data) as T;
  }
}
