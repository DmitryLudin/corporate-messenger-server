import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { cors } from 'src/const/cors';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { NamespacesEventEnum } from 'src/modules/namespaces/const/namespaces-event.enum';

@WebSocketGateway({ cors, namespace: 'namespaces' })
export class NamespacesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly authService: AuthService,
  ) {}

  handleConnection(client: Socket) {
    console.log('namespace connected', client.id, client.rooms.size);
  }

  handleDisconnect(client: Socket) {
    console.log('namespace disconnected', client.id);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(NamespacesEventEnum.NAMESPACE_CONNECT)
  async handleConnect(
    @MessageBody() namespaceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    const channels = await this.channelsMembershipService.findAllUserChannels(
      user.id,
      namespaceId,
    );
    channels.forEach((channel) => client.join(channel.id));
  }
}
