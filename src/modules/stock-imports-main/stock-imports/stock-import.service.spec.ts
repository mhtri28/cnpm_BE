import { Test, TestingModule } from '@nestjs/testing';
import { StockImportService } from './stock-import.service';

describe('StockImportService', () => {
  let service: StockImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockImportService],
    }).compile();

    service = module.get<StockImportService>(StockImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
