import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async findById(namespaceId: string, userId: string) {
    const namespaceMembership = await this.namespaceMemberRepository.findOne({
      where: { namespaceId, userId },
    });

    if (!namespaceMembership) {
      throw new HttpException(
        'Пользователь не является участником данного пространства',
        HttpStatus.NOT_FOUND,
      );
    }

    return namespaceMembership;
  }

  async findAllForUser(userId: string) {
    const namespaceMembership = await this.namespaceMemberRepository.find({
      where: { userId },
      relations: ['namespace'],
      select: ['namespace'],
    });

    return namespaceMembership.map((membership) => membership.namespace);
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(NamespaceMember)
      : this.namespaceMemberRepository;
  }
}
