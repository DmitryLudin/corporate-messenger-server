import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ChannelMessage } from 'src/modules/channels/entities/message.entity';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';
import { UnreadChannelsService } from 'src/modules/channels/services/unread-channels.service';
import { UsersService } from 'src/modules/users/users.service';

@WebSocketGateway({ cors, namespace: 'channels' })
export class ChannelsGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly unreadChannelsService: UnreadChannelsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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

  async emitNewChannelMembers(channelId: string, data: AddChannelMembersDto) {
    const users = await this.usersService.getByIds(data.userIds);
    this.server.to(channelId).emit(ChannelsEventEnum.NEW_CHANNEL_MEMBERS, {
      users: this.deserializeData(users),
    });
  }

  async emitRemovedChannelMember(
    channelId: string,
    data: RemoveChannelMemberDto,
  ) {
    const user = await this.usersService.getById(data.userId);
    this.server.to(channelId).emit(ChannelsEventEnum.REMOVED_CHANNEL_MEMBER, {
      users: this.deserializeData(user),
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage(ChannelsEventEnum.CHANNEL_MESSAGE)
  async handleMessageEvent(
    @MessageBody() data: CreateChannelMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.channelMessagesService.create(data);

    client.to(data.channelId).emit(ChannelsEventEnum.CHANNEL_MESSAGE, message);

    const memberships =
      await this.channelsMembershipService.findAllChannelMembership(
        data.channelId,
      );

    memberships.forEach(({ user }) => {
      this.unreadChannelsService.markAsUnread(user.id, data.channelId);
      client.to(user.id).emit(ChannelsEventEnum.UNREAD_CHANNEL, {
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
  @SubscribeMessage(ChannelsEventEnum.UNREAD_CHANNEL_TIMESTAMP)
  async handleUpdateChannelTimestampEvent(
    @MessageBody() data: UnreadChannelTimestampDto,
  ) {
    return this.unreadChannelsService.markAsRead(data);
  }

  private deserializeData<T extends object>(data: T): T {
    return instanceToPlain(data) as T;
  }
}
