import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NamespaceMember } from 'src/modules/namespaces/entities/namespace-member.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class NamespaceMembersService {
  constructor(
    @InjectRepository(NamespaceMember)
    private namespaceMemberRepository: Repository<NamespaceMember>,
  ) {}

  async addMember(
    namespaceId: string,
    userId: string,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);
    const member = repository.create({ namespaceId, userId });
    return repository.insert(member);
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(NamespaceMember)
      : this.namespaceMemberRepository;
  }
}
