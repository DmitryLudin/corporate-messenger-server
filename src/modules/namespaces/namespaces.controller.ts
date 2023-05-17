import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { RequestWithUser } from 'src/modules/auth/types';
import { ChannelsGateway } from 'src/modules/channels/channels.gateway';
import { JoinNamespaceDto } from 'src/modules/namespaces/dto/join-namespace.dto';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { NamespacesService } from './namespaces.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class NamespacesController {
  constructor(
    private readonly namespacesService: NamespacesService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findAllForUser(@Req() { user }: RequestWithUser) {
    return this.namespacesService.findAllForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':name')
  async findByName(
    @Req() { user }: RequestWithUser,
    @Param('name') name: string,
  ) {
    return this.namespacesService.findByName(name, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(
    @Req() { user }: RequestWithUser,
    @Body() createNamespaceDto: CreateNamespaceDto,
  ) {
    return this.namespacesService.create({
      ...createNamespaceDto,
      userId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async join(@Req() { user }: RequestWithUser, @Body() data: JoinNamespaceDto) {
    const { namespace, channel } = await this.namespacesService.join(
      data.namespaceName,
      user.id,
    );
    await this.channelsGateway.emitChannelMembersCount(channel.id);
    return namespace;
  }
}
