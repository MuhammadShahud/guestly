import { Test, TestingModule } from '@nestjs/testing';
import { PmsWebhookService } from './pms-webhook.service';

describe('PmsWebhookService', () => {
  let service: PmsWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PmsWebhookService],
    }).compile();

    service = module.get<PmsWebhookService>(PmsWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
