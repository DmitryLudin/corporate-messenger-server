import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMembersController } from 'src/modules/channels/modules/members/members.controller';

describe('MembersController', () => {
  let controller: ChannelMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelMembersController],
    }).compile();

    controller = module.get<ChannelMembersController>(ChannelMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
