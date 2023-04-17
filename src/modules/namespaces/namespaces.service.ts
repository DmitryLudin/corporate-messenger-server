import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { CreateNamespaceTransaction } from 'src/modules/namespaces/transactions/create-namespace.transaction';
import { Repository } from 'typeorm';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { UpdateNamespaceDto } from './dto/update-namespace.dto';

@Injectable()
export class NamespacesService {
  constructor(
    @InjectRepository(Namespace)
    private namespaceRepository: Repository<Namespace>,
    private readonly createNamespaceTransaction: CreateNamespaceTransaction,
  ) {}

  async create(dto: CreateNamespaceDto) {
    const namespace = await this.createNamespaceTransaction.run(dto);
    return this.findOne(namespace.id);
  }

  async findAll() {
    return this.namespaceRepository.find();
  }

  async findOne(id: string) {
    return this.namespaceRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateNamespaceDto) {
    await this.namespaceRepository.update({ id }, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.namespaceRepository.delete(id);
  }
}
