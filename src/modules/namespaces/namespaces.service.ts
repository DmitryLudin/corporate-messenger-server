import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly createNamespaceTransaction: CreateNamespaceTransaction,
    private readonly joinNamespaceTransaction: JoinNamespaceTransaction,
  ) {}

  async create(dto: CreateNamespaceWithUserIdDto) {
    const namespace = await this.createNamespaceTransaction.run(dto);
    return this.findById(namespace.id);
  }

  async findById(id: string) {
    const namespace = await this.namespaceRepository.findOne({ where: { id } });

    if (!namespace) {
      throw new HttpException(
        'Пространства с таким ID не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return namespace;
  }

  async findByName(name: string) {
    const namespace = await this.namespaceRepository.findOne({
      where: { name },
    });

    if (!namespace) {
      throw new HttpException(
        'Пространства с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return namespace;
  }

  async join(namespaceName: string, userId: string) {
    const namespace = await this.findByName(namespaceName);
    await this.joinNamespaceTransaction.run({
      namespaceId: namespace.id,
      userId,
    });

    return namespace;
  }
}
