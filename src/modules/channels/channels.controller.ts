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
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/channels/dto/update-channel.dto';

@Controller('channels')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

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
}
