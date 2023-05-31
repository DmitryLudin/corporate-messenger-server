import {
  Body,
  ClassSerializerInterceptor,
  Controller,
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
import {
  AddChannelMembersDto,
  CreateChannelDto,
  RemoveChannelMemberDto,
  UpdateChannelDto,
} from 'src/modules/channels/dto';
import { ChannelModel } from 'src/modules/channels/models';
import {
  ChannelMembersService,
  ChannelMessagesService,
} from 'src/modules/channels/services';
import {
  AddChannelMembersTransaction,
  CreateChannelTransaction,
  RemoveChannelMemberTransaction,
} from 'src/modules/channels/transactions';

@Controller('channels')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelMembersService: ChannelMembersService,
    private readonly channelMessagesService: ChannelMessagesService,
    private readonly channelsGateway: ChannelsGateway,
    private readonly createChannelTransaction: CreateChannelTransaction,
    private readonly addChannelMembersTransaction: AddChannelMembersTransaction,
    private readonly removeChannelMemberTransaction: RemoveChannelMemberTransaction,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(
    @Param('namespaceId') namespaceId: string,
    @Req() { user }: RequestWithUser,
    @Query() options: IPaginationOptions,
  ) {
    return this.channelsService.getChannels(
      { namespaceId, userId: user.id },
      options,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getAllUserChannels(
    @Param('namespaceId') namespaceId: string,
    @Req() { user }: RequestWithUser,
  ): Promise<ChannelModel[]> {
    return this.channelsService.getAllUserChannels({
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
    return this.channelsService.getByName(namespaceId, channelName, user.id);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Param('namespaceId') namespaceId: string,
    @Req() { user }: RequestWithUser,
    @Body() data: CreateChannelDto,
  ) {
    const channel = await this.createChannelTransaction.run({
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
    // this.channelsGateway.emitUpdatedChannel(channel);
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
    @Req() { user }: RequestWithUser,
    @Body() data: AddChannelMembersDto,
  ) {
    await this.addChannelMembersTransaction.run({
      channelId,
      namespaceId,
      ...data,
    });
    const channel = await this.channelsService.getById(channelId, {
      namespaceId,
      userId: user.id,
    });
    this.channelsGateway.emitChannelMembersCount(channel);
    return channel;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post(':channelId/members/remove')
  async removeMember(
    @Param('namespaceId') namespaceId: string,
    @Param('channelId') channelId: string,
    @Req() { user }: RequestWithUser,
    @Body() data: RemoveChannelMemberDto,
  ) {
    await this.removeChannelMemberTransaction.run({
      channelId,
      ...data,
    });
    const channel = await this.channelsService.getById(channelId, {
      namespaceId,
      userId: user.id,
    });
    this.channelsGateway.emitChannelMembersCount(channel);
    return channel;
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
