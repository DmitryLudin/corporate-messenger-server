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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { AddChannelMembersDto } from 'src/modules/channels/dto/add-channel-members.dto';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { RemoveChannelMemberDto } from 'src/modules/channels/dto/remove-channel-member.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';
import { ChannelsMembershipService } from 'src/modules/channels/services/membership.service';

@Controller('channels')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelsMembershipService: ChannelsMembershipService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  // TODO: добавить пагинацию
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.channelsService.findAll();
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
  @Get(':userId')
  async getAllUserChannels(@Param('userId') userId: string) {
    return this.channelsMembershipService.findAllUserChannels(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') channelId: string) {
    return this.channelsService.findOne(channelId);
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

  // TODO: добавить пагинацию
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getChannelMembers(@Param('id') channelId: string) {
    return this.channelsMembershipService.findAllChannelMembers(channelId);
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
}
