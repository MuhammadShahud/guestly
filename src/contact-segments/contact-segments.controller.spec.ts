import { Test, TestingModule } from '@nestjs/testing';
import { ContactSegmentsController } from './contact-segments.controller';
import { ContactSegmentsService } from './contact-segments.service';

describe('ContactSegmentsController', () => {
  let controller: ContactSegmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactSegmentsController],
      providers: [ContactSegmentsService],
    }).compile();

    controller = module.get<ContactSegmentsController>(ContactSegmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
