import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { RequestWithUser } from 'src/modules/auth/types';
import { JoinNamespaceDto } from 'src/modules/namespaces/dto/join-namespace.dto';
import { NamespaceMembersService } from 'src/modules/namespaces/services/members.service';
import { NamespacesService } from './namespaces.service';
import { CreateNamespaceDto } from './dto/create-namespace.dto';

@Controller()
export class NamespacesController {
  constructor(
    private readonly namespacesService: NamespacesService,
    private readonly namespaceMembersService: NamespaceMembersService,
  ) {}

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
  @Get('me')
  findAllForUser(@Req() { user }: RequestWithUser) {
    return this.namespaceMembersService.findAllForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async join(@Req() { user }: RequestWithUser, @Body() data: JoinNamespaceDto) {
    return this.namespacesService.join(data.namespaceName, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':name')
  async findByName(
    @Req() { user }: RequestWithUser,
    @Param('name') name: string,
  ) {
    const namespace = await this.namespacesService.findByName(name);
    await this.namespaceMembersService.findById(namespace.id, user.id);
    return namespace;
  }
}
