import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { NamespacesEventEnum } from 'src/modules/namespaces/const/namespaces-event.enum';

@WebSocketGateway()
export class NamespacesGateway {
  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly authService: AuthService,
  ) {}

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

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(NamespacesEventEnum.NAMESPACE_DISCONNECT)
  async handleDisconnect(
    @MessageBody() namespaceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    const channels = await this.channelsMembershipService.findAllUserChannels(
      user.id,
      namespaceId,
    );
    channels.forEach((channel) => client.leave(channel.id));
  }
}
