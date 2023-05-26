import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelsService } from 'src/modules/channels/channels.service';
import { NamespaceMember } from 'src/modules/namespaces/entities/namespace-member.entity';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { JoinNamespaceTransaction } from 'src/modules/namespaces/transactions/join-namespace.transaction';
import { Repository } from 'typeorm';
import { CreateNamespaceWithUserIdDto } from './dto/create-namespace.dto';

@Injectable()
export class NamespacesService {
  constructor(
    @InjectRepository(Namespace)
    private namespaceRepository: Repository<Namespace>,
    @InjectRepository(NamespaceMember)
    private namespaceMembersRepository: Repository<NamespaceMember>,
    private readonly createNamespaceTransaction: CreateNamespaceTransaction,
    private readonly joinNamespaceTransaction: JoinNamespaceTransaction,
    private readonly channelsService: ChannelsService,
  ) {}

  async getByName(namespaceName: string) {
    const namespace = await this.namespaceRepository.findOne({
      where: { name: namespaceName },
    });

    if (!namespace) {
      throw new HttpException(
        'Пространства с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return namespace;
  }

  async findByName(name: string, userId: string) {
    const namespaces = await this.namespaceRepository.find({
      relations: { members: true },
      where: { name, members: { userId } },
      select: { members: { id: true } },
    });
    const namespace = namespaces[0];

    if (!namespace) {
      throw new HttpException(
        'Пространства с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    if (namespace.members?.length === 0) {
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }

    return namespace;
  }

  async findAllForUser(userId: string) {
    return this.namespaceRepository.find({
      where: { members: { userId } },
    });
  }

  async create(dto: CreateNamespaceWithUserIdDto) {
    return await this.createNamespaceTransaction.run(dto);
  }

  async join(namespaceName: string, userId: string) {
    const namespace = await this.getByName(namespaceName);
    const channel = await this.channelsService.findByName({
      name: 'general',
      namespaceId: namespace.id,
    });

    await this.joinNamespaceTransaction.run({
      namespaceId: namespace.id,
      channelId: channel.id,
      userId,
    });

    return { namespace, channel };
  }
}
