import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';
import { EntityManager } from 'typeorm';

import { UpdateChannelDtoWithMeta } from './dto';
import { ChannelModel } from './models';
import { ChannelsRepository } from './repositories';

@Injectable()
export class ChannelsService {
  constructor(private readonly channelsRepository: ChannelsRepository) {}

  async findUserChannelIds(userId: string, namespaceId: string) {
    return this.channelsRepository.findUserChannelIds(userId, namespaceId);
  }

  async findByName(options: { name: string; namespaceId: string }) {
    return this.channelsRepository.findByName(options);
  }

  async getChannels(
    data: { namespaceId: string; userId: string },
    options: IPaginationOptions,
  ): Promise<Pagination<ChannelModel>> {
    const channelPaginationRaw =
      await this.channelsRepository.findWithUserDetails(data, options);

    return new Pagination<ChannelModel>(
      channelPaginationRaw.items.map((channel) => new ChannelModel(channel)),
      channelPaginationRaw.meta,
    );
  }

  async getAllUserChannels({
    userId,
    namespaceId,
  }: {
    userId: string;
    namespaceId: string;
  }): Promise<ChannelModel[]> {
    const channelsRaw =
      await this.channelsRepository.findUserChannelsWithDetails({
        userId,
        namespaceId,
      });
    return channelsRaw.map((channel) => new ChannelModel(channel));
  }

  async getByName(namespaceId: string, channelName: string, userId: string) {
    const channelRaw = await this.channelsRepository.findByNameWithUserDetails(
      namespaceId,
      channelName,
      userId,
    );

    if (!channelRaw) {
      throw new HttpException(
        'Канала с таким именем не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return new ChannelModel(channelRaw);
  }

  async getById(
    channelId: string,
    options: { namespaceId: string; userId: string },
  ) {
    const channelRaw = await this.channelsRepository.findByIdWithUserDetails(
      channelId,
      options,
    );

    if (!channelRaw) {
      throw new HttpException(
        'Канала с таким ID не существует',
        HttpStatus.NOT_FOUND,
      );
    }

    return new ChannelModel(channelRaw);
  }

  async updateChannel(channelId: string, data: UpdateChannelDtoWithMeta) {
    return this.channelsRepository.update(channelId, data);
  }

  async incrementMembersCount(
    channelId: string,
    transactionManager?: EntityManager,
  ) {
    return this.channelsRepository.incrementMembersCount(
      channelId,
      transactionManager,
    );
  }

  async decrementMembersCount(
    channelId: string,
    transactionManager?: EntityManager,
  ) {
    return this.channelsRepository.decrementMembersCount(
      channelId,
      transactionManager,
    );
  }
}
