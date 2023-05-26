import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddChannelMembersWithNamespaceDto } from 'src/modules/channels/dto';
import { ChannelMember } from 'src/modules/channels/entities';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMember)
    private channelMembersRepository: Repository<ChannelMember>,
  ) {}

  async addMembers(
    channelId: string,
    { userIds, namespaceId }: AddChannelMembersWithNamespaceDto,
    transactionManager?: EntityManager,
  ) {
    const repository = this.getRepository(transactionManager);

    const members = userIds.map((userId: string) =>
      repository.create({ channelId, userId, namespaceId }),
    );

    return await repository.insert(members);
  }

  async getMembersCount(channelId: string) {
    return await this.channelMembersRepository.countBy({
      channelId,
    });
  }

  async removeMember(channelId: string, userId: string) {
    return await this.channelMembersRepository.delete({ userId, channelId });
  }

  private getRepository(transactionManager?: EntityManager) {
    return transactionManager
      ? transactionManager.getRepository(ChannelMember)
      : this.channelMembersRepository;
  }
}
