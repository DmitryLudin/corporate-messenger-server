import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChannelsModule } from 'src/modules/channels/channels.module';
import { NamespaceMember } from 'src/modules/namespaces/entities/namespace-member.entity';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { NamespacesService } from './namespaces.service';
import { NamespacesController } from './namespaces.controller';
import { NamespaceMembersService } from './services/members.service';
import { NamespacesGateway } from './namespaces.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Namespace, NamespaceMember]),
    ChannelsModule,
    AuthModule,
  ],
  controllers: [NamespacesController],
  providers: [
    CreateNamespaceTransaction,
    NamespacesService,
    NamespaceMembersService,
    NamespacesGateway,
  ],
})
export class NamespacesModule {}
