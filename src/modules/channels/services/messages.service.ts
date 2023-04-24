import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CreateChannelMessageDto } from 'src/modules/channels/dto/create-message.dto';
import { RemoveChannelMessageDto } from 'src/modules/channels/dto/remove-message.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/dto/update-message.dto';
import { ChannelMessage } from 'src/modules/channels/entities/channel-message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChannelMessagesService {
  constructor(
    @InjectRepository(ChannelMessage)
    private messagesRepository: Repository<ChannelMessage>,
  ) {}

  async create(createMessageDto: CreateChannelMessageDto) {
    const message = this.messagesRepository.create(createMessageDto);
    await this.messagesRepository.save(message);
    return this.findOne(message.id);
  }

  async findAll(channelId: string, options: IPaginationOptions) {
    return paginate(this.messagesRepository, options, {
      where: { channelId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    return this.messagesRepository.findOne({ where: { id } });
  }

  async update({ id, text }: UpdateChannelMessageDto) {
    await this.messagesRepository.update({ id }, { text });
    return this.findOne(id);
  }

  async remove(data: RemoveChannelMessageDto) {
    return this.messagesRepository.delete(data.id);
  }

  async findLastMessage(channelId: string) {
    return this.messagesRepository.findOne({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });
  }
}
