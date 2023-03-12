import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsMembershipGateway } from 'src/modules/channels/modules/membership/membership.gateway';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

describe('ChannelsMembershipGateway', () => {
  let gateway: ChannelsMembershipGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelsMembershipGateway, ChannelsMembershipService],
    }).compile();

    gateway = module.get<ChannelsMembershipGateway>(ChannelsMembershipGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
