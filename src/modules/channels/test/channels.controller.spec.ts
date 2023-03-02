import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from 'src/modules/channels/channels.controller';

describe('ChannelsController', () => {
  let controller: ChannelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
    }).compile();

    controller = module.get<ChannelsController>(ChannelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
