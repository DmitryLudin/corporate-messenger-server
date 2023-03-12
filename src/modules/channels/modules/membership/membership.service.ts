import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { AddChannelMemberDto } from 'src/modules/channels/modules/membership/dto/add-channel-member.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelsMembershipService {
  constructor(
    @InjectRepository(ChannelMember)
    private channelMembersRepository: Repository<ChannelMember>,
  ) {}

  async create(data: AddChannelMemberDto) {
    const channel = this.channelMembersRepository.create(data);
    return await this.channelMembersRepository.insert(channel);
  }

  async findAll(userId: string) {
    const channelMemberships = await this.channelMembersRepository.find({
      where: { userId },
      relations: ['channel'],
      select: ['channel'],
    });
    return channelMemberships.map((membership) => membership.channel);
  }

  async remove(userId: string) {
    return await this.channelMembersRepository.delete({ userId });
  }
}
