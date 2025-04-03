import { Injectable, NotFoundException } from '@nestjs/common';
import { StockImport } from '../entities/stock-import.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
@Injectable()
export class StockImportService {
  constructor(
    @InjectRepository(StockImport)
    private readonly stockImportRepo: Repository<StockImport>,
  ) {}

  // Tạo Stock Import 
  async create(createStockImportDto: CreateStockImportDto) {
    const stockImport = this.stockImportRepo.create(createStockImportDto);
    return await this.stockImportRepo.save(stockImport);
  }

  // Lấy tất cả các Stock Import s
  async findAll() {
    return await this.stockImportRepo.find({
      relations: ['supplier', 'stockImportItems','employee'], // Quan hệ đúng trong StockImport
    });
  }

  // Lấy một Stock Import  theo ID
  async findOne(id: number) {
    const stockImport = await this.stockImportRepo.findOne({
      where: { id },
      relations: ['supplier', 'stockImportItems','employee'], // Quan hệ đúng trong StockImport
    });
    if (!stockImport) throw new NotFoundException(`Stock Import  with ID ${id} not found`);
    return stockImport;
  }

//   // Cập nhật Stock Import 
//   async update(id: number, updateStockImportDto: UpdateStockImportDto) {
//     const stockImport = await this.stockImportRepo.preload({ id, ...updateStockImportDto });
//     if (!stockImport) throw new NotFoundException(`Stock Import  with ID ${id} not found`);
//     return await this.stockImportRepo.save(stockImport);
//   }

//   // Xóa Stock Import 
//   async remove(id: number) {
//     const result = await this.stockImportRepo.delete(id);
//     if (result.affected === 0) throw new NotFoundException(`Stock Import  with ID ${id} not found`);
//     return { message: 'Stock Import  deleted successfully' };
//   }
}