import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import { Server } from 'socket.io';
import { cors } from 'src/const/cors';
import { ChannelsEventEnum } from 'src/modules/channels/const/channels-event.enum';
import { NewChannelDto } from 'src/modules/channels/dto/new-channel.dto';

@WebSocketGateway({ cors, namespace: 'channels' })
export class ChannelsGateway {
  @WebSocketServer()
  server: Server;

  emitNewChannelToUsers({ userIds, channel }: NewChannelDto) {
    this.server.to(userIds).emit(ChannelsEventEnum.NEW_CHANNEL, {
      channel: this.deserializeData(channel),
      userIds,
    });
  }

  private deserializeData<T extends object>(data: T): T {
    return instanceToPlain(data) as T;
  }
}
