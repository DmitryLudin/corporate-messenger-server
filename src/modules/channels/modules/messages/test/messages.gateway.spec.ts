import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMessagesService } from 'src/modules/channels/modules/messages/messages.service';
import { ChannelMessagesGateway } from '../messages.gateway';

describe('MessagesGateway', () => {
  let gateway: ChannelMessagesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelMessagesGateway, ChannelMessagesService],
    }).compile();

    gateway = module.get<ChannelMessagesGateway>(ChannelMessagesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
