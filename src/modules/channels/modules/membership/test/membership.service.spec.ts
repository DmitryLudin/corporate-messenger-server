import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsMembershipService } from 'src/modules/channels/modules/membership/membership.service';

describe('ChannelsMembershipService', () => {
  let service: ChannelsMembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelsMembershipService],
    }).compile();

    service = module.get<ChannelsMembershipService>(ChannelsMembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
