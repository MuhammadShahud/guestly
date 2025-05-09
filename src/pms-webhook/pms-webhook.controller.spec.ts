import { Test, TestingModule } from '@nestjs/testing';
import { PmsWebhookController } from './pms-webhook.controller';

describe('PmsWebhookController', () => {
  let controller: PmsWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PmsWebhookController],
    }).compile();

    controller = module.get<PmsWebhookController>(PmsWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
