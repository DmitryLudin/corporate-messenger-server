import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { cors } from 'src/const/cors';
import { ChannelsEventEnum } from 'src/modules/channels/const/channels-event.enum';

@WebSocketGateway({ cors, namespace: 'channels' })
export class ChannelsGateway {
  @WebSocketServer()
  server: Server;

  emitNewChannelToUsers(channel, userIds) {
    this.server
      .to(userIds)
      .emit(ChannelsEventEnum.NEW_CHANNEL, { channel, userIds });
  }
}
