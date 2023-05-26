import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsModule } from 'src/modules/channels';
import { NamespaceMember } from 'src/modules/namespaces/entities/namespace-member.entity';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { JoinNamespaceTransaction } from 'src/modules/namespaces/transactions/join-namespace.transaction';
import { NamespacesService } from './namespaces.service';
import { NamespacesController } from './namespaces.controller';
import { NamespaceMembersService } from './services/members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Namespace, NamespaceMember]),
    ChannelsModule,
  ],
  controllers: [NamespacesController],
  providers: [
    CreateNamespaceTransaction,
    JoinNamespaceTransaction,
    NamespacesService,
    NamespaceMembersService,
  ],
})
export class NamespacesModule {}
