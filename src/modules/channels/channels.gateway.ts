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
import { cors } from 'src/const/cors';
import { AuthService } from 'src/modules/auth/auth.service';
import { ChannelsEventEnum } from 'src/modules/channels/const/channels-event.enum';
import { AddChannelMembersDto } from 'src/modules/channels/dto/add-channel-members.dto';
import { CreateChannelMessageDto } from 'src/modules/channels/dto/create-message.dto';
import { RemoveChannelMemberDto } from 'src/modules/channels/dto/remove-channel-member.dto';
import { RemoveChannelMessageDto } from 'src/modules/channels/dto/remove-message.dto';
import { UnreadChannelTimestampDto } from 'src/modules/channels/dto/unread-timestamp.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/dto/update-message.dto';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { UsersService } from 'src/modules/users/users.service';

@WebSocketGateway({ cors, namespace: 'channels' })
export class ChannelsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly unreadChannelsService: UnreadChannelsService,
    private readonly usersService: UsersService,
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

  async emitNewChannelMembers(channelId: string, data: AddChannelMembersDto) {
    const users = await this.usersService.getByIds(data.userIds);
    this.server.to(channelId).emit(ChannelsEventEnum.MEMBERS_ADDED, {
      users: this.deserializeData(users),
    });
  }

  async emitRemovedChannelMember(
    channelId: string,
    data: RemoveChannelMemberDto,
  ) {
    const user = await this.usersService.getById(data.userId);
    this.server.to(channelId).emit(ChannelsEventEnum.MEMBER_REMOVED, {
      users: this.deserializeData(user),
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.JOIN_CHANNELS)
  async handleJoinChannels(
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
  @SubscribeMessage(ChannelsEventEnum.MESSAGE)
  async handleMessageEvent(
    @MessageBody() data: CreateChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.channelMessagesService.create(data);

    client.to(data.channelId).emit(ChannelsEventEnum.MESSAGE, message);

    const memberships =
      await this.channelsMembershipService.findAllChannelMembership(
        data.channelId,
      );

    memberships.forEach(({ user }) => {
      this.unreadChannelsService.markAsUnread(user.id, data.channelId);
      client.to(user.id).emit(ChannelsEventEnum.UNREAD, {
        channelId: data.channelId,
      });
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.MESSAGE_UPDATED)
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
  @SubscribeMessage(ChannelsEventEnum.MESSAGE_REMOVED)
  async handleRemoveMessage(
    @MessageBody() data: RemoveChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.channelMessagesService.remove(data);

    client.to(data.channelId).emit(ChannelsEventEnum.MESSAGE_REMOVED);
    return {
      event: ChannelsEventEnum.MESSAGE_REMOVED,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.UNREAD_TIMESTAMP)
  async handleUpdateChannelTimestampEvent(
    @MessageBody() data: UnreadChannelTimestampDto,
  ) {
    return this.unreadChannelsService.markAsRead(data);
  }

  private deserializeData<T extends object>(data: T): T {
    return instanceToPlain(data) as T;
  }
}
