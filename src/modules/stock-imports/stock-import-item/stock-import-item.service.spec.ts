import { Test, TestingModule } from '@nestjs/testing';
import { StockImportItemService } from './stock-import-item.service';

describe('StockImportItemService', () => {
  let service: StockImportItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockImportItemService],
    }).compile();

    service = module.get<StockImportItemService>(StockImportItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
