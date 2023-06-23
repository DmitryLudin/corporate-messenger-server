import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { wsConfig } from 'src/const/websocket';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { ChannelsEventEnum } from 'src/modules/channels/const/channels-event.enum';
import { CreateChannelMessageDto } from 'src/modules/channels/dto/create-message.dto';
import { RemoveChannelMessageDto } from 'src/modules/channels/dto/remove-message.dto';
import { UnreadChannelTimestampDto } from 'src/modules/channels/dto/unread-timestamp.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/dto/update-message.dto';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelStatusesService } from 'src/modules/channels/services';
import { ChannelMembersService } from 'src/modules/channels/services/members.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';

@WebSocketGateway({ ...wsConfig, namespace: 'channels' })
export class ChannelsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly channelMembersService: ChannelMembersService,
    private readonly channelStatusesService: ChannelStatusesService,
    private readonly authService: AuthService,
  ) {}

  handleConnection(client: Socket) {
    console.log('namespace connected', client.id, client.rooms.size);
  }

  handleDisconnect(client: Socket) {
    console.log('namespace disconnected', client.id);
  }

  emitNewChannel(channel: Channel, userIds: Array<string>) {
    if (userIds && userIds.length) {
      this.server.to(userIds).emit(ChannelsEventEnum.NEW, {
        channel: this.deserializeData(channel),
      });
    }
  }

  emitUpdatedChannel(channel: Channel) {
    this.server.to(channel.id).emit(ChannelsEventEnum.UPDATED, {
      channel: this.deserializeData(channel),
    });
  }

  emitChannelMembersCount(channel: Channel) {
    this.server.to(channel.id).emit(ChannelsEventEnum.MEMBERS_COUNT, {
      channelId: channel.id,
      membersCount: channel.membersCount,
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.JOIN_CHANNELS)
  async handleJoinChannels(
    @MessageBody() namespaceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    const channels = await this.channelsService.findUserChannelIds(
      user.id,
      namespaceId,
    );
    channels.forEach((channel) => client.join(channel.id));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.SEND_MESSAGE)
  async handleMessageEvent(
    @MessageBody() data: CreateChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<ChannelMessage>> {
    const message = await this.channelMessagesService.create(data);

    client.to(data.channelId).emit(ChannelsEventEnum.NEW_MESSAGE, message);

    const channelMembers = await this.channelMembersService.getChannelMembers(
      data.channelId,
    );

    channelMembers.forEach((member) => {
      this.channelStatusesService.update(data.channelId, member.userId, {
        isUnread: true,
        lastReadTimestamp: message.createdAt.getTime(),
      });
      client.to(data.channelId).emit(ChannelsEventEnum.UNREAD, {
        channelId: data.channelId,
        lastReadTimestamp: message.createdAt.getTime(),
        isUnread: true,
      });
    });

    return {
      event: ChannelsEventEnum.NEW_MESSAGE,
      data: message,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.UPDATE_MESSAGE)
  async handleUpdateMessage(
    @MessageBody() data: UpdateChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<ChannelMessage>> {
    const message = await this.channelMessagesService.update(data);

    client
      .to(message.channelId)
      .emit(ChannelsEventEnum.MESSAGE_UPDATED, this.deserializeData(message));
    return {
      event: ChannelsEventEnum.MESSAGE_UPDATED,
      data: message,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.REMOVE_MESSAGE)
  async handleRemoveMessage(
    @MessageBody() data: RemoveChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.channelMessagesService.remove(data);

    client.to(data.channelId).emit(ChannelsEventEnum.MESSAGE_REMOVED, data);
    return {
      event: ChannelsEventEnum.MESSAGE_REMOVED,
      data,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.UNREAD_TIMESTAMP)
  async handleUpdateChannelTimestampEvent(
    @MessageBody() data: UnreadChannelTimestampDto,
  ) {
    await this.channelStatusesService.update(data.channelId, data.userId, {
      isUnread: false,
      lastReadTimestamp: data.timestamp,
    });
  }

  private deserializeData<T extends object>(data: T): T {
    return instanceToPlain(data) as T;
  }
}
