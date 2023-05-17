import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { RequestWithUser } from 'src/modules/auth/types';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { AddChannelMembersDto } from 'src/modules/channels/dto/add-channel-members.dto';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { RemoveChannelMemberDto } from 'src/modules/channels/dto/remove-channel-member.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { ChannelMembersService } from 'src/modules/channels/services/members.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';

@Controller('channels')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelMembersService: ChannelMembersService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(
    @Param('namespaceId') namespaceId: string,
    @Query() options: IPaginationOptions,
  ) {
    return this.channelsService.findAll(namespaceId, options);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getAllUserChannels(
    @Param('namespaceId') namespaceId: string,
    @Req() { user }: RequestWithUser,
  ) {
    return this.channelsService.findAllUserChannels({
      userId: user.id,
      namespaceId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':channelName')
  async getByName(
    @Param('namespaceId') namespaceId: string,
    @Param('channelName') channelName: string,
    @Req() { user }: RequestWithUser,
  ) {
    return this.channelsService.findByName(namespaceId, channelName, user.id);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Param('namespaceId') namespaceId: string,
    @Req() { user }: RequestWithUser,
    @Body() data: CreateChannelDto,
  ) {
    const channel = await this.channelsService.create({
      ...data,
      namespaceId,
      userId: user.id,
    });
    this.channelsGateway.emitNewChannel(channel, data.members);
    return channel;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Patch(':channelId/update')
  async update(
    @Param('channelId') id: string,
    @Body() data: UpdateChannelDto,
    @Req() { user }: RequestWithUser,
  ) {
    const channel = await this.channelsService.update(id, {
      ...data,
      userId: user.id,
    });
    this.channelsGateway.emitUpdatedChannel(channel);
    return channel;
  }

  // @UseGuards(JwtAuthGuard)
  // @Get(':channelId/members')
  // async getChannelMembers(
  //   @Param('channelId') channelId: string,
  //   @Query() options: IPaginationOptions,
  // ) {
  //   return this.channelsMembershipService.findAllChannelMembers(
  //     channelId,
  //     options,
  //   );
  // }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post(':channelId/members/add')
  async addNewMembers(
    @Param('namespaceId') namespaceId: string,
    @Param('channelId') channelId: string,
    @Body() data: AddChannelMembersDto,
  ) {
    await this.channelMembersService.addMembers(channelId, {
      ...data,
      namespaceId,
    });
    return this.channelsGateway.emitChannelMembersCount(channelId);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Delete(':channelId/members/remove')
  async removeMember(
    @Param('channelId') channelId: string,
    @Body() data: RemoveChannelMemberDto,
  ) {
    await this.channelMembersService.removeMember(channelId, data.userId);
    return this.channelsGateway.emitChannelMembersCount(channelId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':channelId/messages')
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Query() options: IPaginationOptions,
  ) {
    return this.channelMessagesService.findAll(channelId, options);
  }
}
