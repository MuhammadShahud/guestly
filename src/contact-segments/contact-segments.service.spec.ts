import { Test, TestingModule } from '@nestjs/testing';
import { ContactSegmentsService } from './contact-segments.service';

describe('ContactSegmentsService', () => {
  let service: ContactSegmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactSegmentsService],
    }).compile();

    service = module.get<ContactSegmentsService>(ContactSegmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
