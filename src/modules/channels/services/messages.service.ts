import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelMessageDto } from 'src/modules/channels/dto/create-message.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/dto/update-message.dto';
import { ChannelMessage } from 'src/modules/channels/entities/message.entity';
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

  findAll(channelId: string) {
    return this.messagesRepository.find({ where: { channelId } });
  }

  findOne(id: string) {
    return this.messagesRepository.findOne({ where: { id } });
  }

  update(id: number, updateMessageDto: UpdateChannelMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  async findLastMessage(channelId: string) {
    return this.messagesRepository.findOne({
      where: { channelId },
      order: { createdAt: 'DESC' },
    });
  }
}
