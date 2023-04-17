import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { RequestWithUser } from 'src/modules/auth/types';
import { NamespaceMembersService } from 'src/modules/namespaces/services/members.service';
import { NamespacesService } from './namespaces.service';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';

@Controller('namespaces')
export class NamespacesController {
  constructor(
    private readonly namespacesService: NamespacesService,
    private readonly namespaceMembersService: NamespaceMembersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createNamespaceDto: CreateNamespaceDto) {
    return this.namespacesService.create(createNamespaceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllForUser(@Req() { user }: RequestWithUser) {
    return this.namespaceMembersService.findAllForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.namespacesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNamespaceDto: UpdateNamespaceDto,
  ) {
    return this.namespacesService.update(id, updateNamespaceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.namespacesService.remove(id);
  }
}