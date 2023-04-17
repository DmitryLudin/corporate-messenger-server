import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NamespaceMember } from 'src/modules/namespaces/entities/member.entity';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { NamespacesService } from './namespaces.service';
import { NamespacesController } from './namespaces.controller';
import { NamespaceMembersService } from './services/members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Namespace]),
    TypeOrmModule.forFeature([NamespaceMember]),
  ],
  controllers: [NamespacesController],
  providers: [
    CreateNamespaceTransaction,
    NamespacesService,
    NamespaceMembersService,
  ],
})
export class NamespacesModule {}
