import { Test, TestingModule } from '@nestjs/testing';
import { StockImportItemController } from './stock-import-item.controller';

describe('StockImportItemController', () => {
  let controller: StockImportItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockImportItemController],
    }).compile();

    controller = module.get<StockImportItemController>(
      StockImportItemController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
