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
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';
import { ChannelMessagesService } from 'src/modules/channels/services/messages.service';

@Controller('channels')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Query() options: IPaginationOptions) {
    return this.channelsService.findAll(options);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() data: CreateChannelDto) {
    const channel = await this.channelsService.create(data);
    this.channelsGateway.emitNewChannel(data.members, channel);
    return channel;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUserChannels(@Req() { user }: RequestWithUser) {
    return this.channelsMembershipService.findAllUserChannels(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':channelId')
  async getById(
    @Param('channelId') channelId: string,
    @Req() { user }: RequestWithUser,
  ) {
    return this.channelsService.getChannelWithLastReadTimestamp(
      channelId,
      user.id,
    );
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateChannelDto) {
    const channel = await this.channelsService.update(id, data);
    this.channelsGateway.emitUpdatedChannel(channel);
    return channel;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.channelsService.remove(id);
    this.channelsGateway.emitRemovedChannel(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getChannelMembers(
    @Param('id') channelId: string,
    @Query() options: IPaginationOptions,
  ) {
    return this.channelsMembershipService.findAllChannelMembers(
      channelId,
      options,
    );
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  async addNewMembers(
    @Param('id') channelId: string,
    @Body() data: AddChannelMembersDto,
  ) {
    await this.channelsMembershipService.createMultiple(channelId, data);
    return this.channelsGateway.emitNewChannelMembers(channelId, data);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Delete(':id/members')
  async removeMember(
    @Param('id') channelId: string,
    @Body() data: RemoveChannelMemberDto,
  ) {
    await this.channelsMembershipService.remove(channelId, data.userId);
    return this.channelsGateway.emitRemovedChannelMember(channelId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getChannelMessages(
    @Param('id') channelId: string,
    @Query() options: IPaginationOptions,
  ) {
    return this.channelMessagesService.findAll(channelId, options);
  }
}
