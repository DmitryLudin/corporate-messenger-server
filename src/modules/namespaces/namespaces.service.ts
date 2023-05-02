import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { Repository } from 'typeorm';
import {
  CreateNamespaceDto,
  CreateNamespaceWithUserIdDto,
} from './dto/create-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';

@Injectable()
export class NamespacesService {
  constructor(
    @InjectRepository(Namespace)
    private namespaceRepository: Repository<Namespace>,
    private readonly createNamespaceTransaction: CreateNamespaceTransaction,
  ) {}

  async create(dto: CreateNamespaceWithUserIdDto) {
    const namespace = await this.createNamespaceTransaction.run(dto);
    return this.findById(namespace.id);
  }

  async findAll() {
    return this.namespaceRepository.find();
  }

  async findById(id: string) {
    return this.namespaceRepository.findOne({ where: { id } });
  }

  async findByName(name: string) {
    const namespace = await this.namespaceRepository.findOne({
      where: { name },
    });

    if (!namespace) {
      throw new HttpException(
        'Пространства с таким иенем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return namespace;
  }

  async update(id: string, dto: UpdateNamespaceDto) {
    await this.namespaceRepository.update({ id }, dto);
    return this.findById(id);
  }

  async remove(id: string) {
    return this.namespaceRepository.delete(id);
  }
}
