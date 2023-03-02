import { Injectable } from '@nestjs/common';
import { CreateChannelMessageDto } from 'src/modules/channels/modules/messages/dto/create-message.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/modules/messages/dto/update-message.dto';

@Injectable()
export class ChannelMessagesService {
  create(createMessageDto: CreateChannelMessageDto) {
    return 'This action adds a new message';
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateChannelMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
