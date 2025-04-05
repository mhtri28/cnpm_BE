import { Test, TestingModule } from '@nestjs/testing';
import { StockImportController } from './stock-import.controller';

describe('StockImportController', () => {
  let controller: StockImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockImportController],
    }).compile();

    controller = module.get<StockImportController>(StockImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
