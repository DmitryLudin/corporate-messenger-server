import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    const namespace = await this.getByName(name);
    const namespaceMember = await this.namespaceMembersRepository.findOne({
      select: { userId: true, namespaceId: true },
      where: { userId, namespaceId: namespace.id },
    });

    if (!namespaceMember) {
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

    await this.joinNamespaceTransaction.run({
      namespaceId: namespace.id,
      userId,
    });

    return namespace;
  }
}
