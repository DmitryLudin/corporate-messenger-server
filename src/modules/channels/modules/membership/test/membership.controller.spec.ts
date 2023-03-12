import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsMembershipController } from 'src/modules/channels/modules/membership/membership.controller';

describe('ChannelsMembershipController', () => {
  let controller: ChannelsMembershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsMembershipController],
    }).compile();

    controller = module.get<ChannelsMembershipController>(
      ChannelsMembershipController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
