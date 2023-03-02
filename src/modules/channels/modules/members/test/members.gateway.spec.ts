import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMembersGateway } from 'src/modules/channels/modules/members/members.gateway';
import { ChannelMembersService } from 'src/modules/channels/modules/members/members.service';

describe('ChannelsMembersGateway', () => {
  let gateway: ChannelMembersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelMembersGateway, ChannelMembersService],
    }).compile();

    gateway = module.get<ChannelMembersGateway>(ChannelMembersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
