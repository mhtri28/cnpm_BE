import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockImportItem } from '../entities/stock-import-item.entity';
import { CreateStockImportItemDto } from '../dto/create-stock-import-item.dto';

@Injectable()
export class StockImportItemService {
  constructor(
    @InjectRepository(StockImportItem)
    private readonly stockImportItemRepo: Repository<StockImportItem>,
  ) {}

  // Tạo Stock Import Item
  async create(createStockImportItemDto: CreateStockImportItemDto) {
    const stockImportItem = this.stockImportItemRepo.create(
      createStockImportItemDto,
    );
    return await this.stockImportItemRepo.save(stockImportItem);
  }

  // Lấy tất cả các Stock Import Items
  async findAll() {
    return await this.stockImportItemRepo.find({
      relations: ['ingredient', 'stockImport'], // Quan hệ đúng trong StockImportItem
    });
  }

  // Lấy một Stock Import Item theo ID
  async findOne(id: number) {
    const stockImportItem = await this.stockImportItemRepo.findOne({
      where: { id },
      relations: ['ingredient', 'stockImport'], // Quan hệ đúng trong StockImportItem
    });
    if (!stockImportItem)
      throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
    return stockImportItem;
  }

  //   // Cập nhật Stock Import Item
  //   async update(id: number, updateStockImportItemDto: UpdateStockImportItemDto) {
  //     const stockImportItem = await this.stockImportItemRepo.preload({ id, ...updateStockImportItemDto });
  //     if (!stockImportItem) throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
  //     return await this.stockImportItemRepo.save(stockImportItem);
  //   }

  //   // Xóa Stock Import Item
  //   async remove(id: number) {
  //     const result = await this.stockImportItemRepo.delete(id);
  //     if (result.affected === 0) throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
  //     return { message: 'Stock Import Item deleted successfully' };
  //   }
}
