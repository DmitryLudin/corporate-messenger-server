import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { CreateChannelMessageDto } from 'src/modules/channels/modules/messages/dto/create-message.dto';
import { UpdateChannelMessageDto } from 'src/modules/channels/modules/messages/dto/update-message.dto';
import { ChannelMessagesService } from 'src/modules/channels/modules/messages/messages.service';

@WebSocketGateway()
export class ChannelMessagesGateway {
  constructor(private readonly messagesService: ChannelMessagesService) {}

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateChannelMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messagesService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateChannelMessageDto) {
    return this.messagesService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messagesService.remove(id);
  }
}
