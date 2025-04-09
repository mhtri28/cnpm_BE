import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockImportItem } from '../entities/stock-import-item.entity';
import { CreateStockImportItemDto } from '../dto/create-stock-import-item.dto';
import { UpdateStockImportItemDto } from '../dto/update-stock-import-item.dto';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from '../entities/stock-import.entity';

@Injectable()
export class StockImportItemService {
  constructor(
    @InjectRepository(StockImportItem)
    private readonly stockImportItemRepo: Repository<StockImportItem>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(StockImport)
    private readonly stockImportRepo: Repository<StockImport>,
  ) {}

  // Tạo Stock Import Item
  async create(createStockImportItemDto: CreateStockImportItemDto) {
    const { ingredientId, stockImportId, ...rest } = createStockImportItemDto;

    const ingredient = await this.ingredientRepo.findOne({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID ${ingredientId} not found`,
      );
    }

    const stockImport = await this.stockImportRepo.findOne({
      where: { id: String(stockImportId) },
    });
    if (!stockImport) {
      throw new NotFoundException(
        `Stock Import with ID ${stockImportId} not found`,
      );
    }

    const stockImportItem = this.stockImportItemRepo.create({
      ...rest,
      ingredient,
      stockImport,
    });
    return await this.stockImportItemRepo.save(stockImportItem);
  }

  // Lấy tất cả các Stock Import Items
  async findAll() {
    return await this.stockImportItemRepo.find({
      relations: ['ingredient', 'stockImport'],
    });
  }

  // Lấy một Stock Import Item theo ID
  async findOne(id: string) {
    const stockImportItem = await this.stockImportItemRepo.findOne({
      where: { id },
      relations: ['ingredient', 'stockImport'],
    });
    if (!stockImportItem)
      throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
    return stockImportItem;
  }

  // Cập nhật Stock Import Item
  async update(id: string, updateStockImportItemDto: UpdateStockImportItemDto) {
    const { ingredientId, stockImportId, ...rest } = updateStockImportItemDto;

    const stockImportItem = await this.stockImportItemRepo.findOne({
      where: { id },
      relations: ['ingredient', 'stockImport'],
    });
    if (!stockImportItem) {
      throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
    }

    if (ingredientId) {
      const ingredient = await this.ingredientRepo.findOne({
        where: { id: ingredientId },
      });
      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${ingredientId} not found`,
        );
      }
      stockImportItem.ingredient = ingredient;
    }

    if (stockImportId) {
      const stockImport = await this.stockImportRepo.findOne({
        where: { id: String(stockImportId) },
      });
      if (!stockImport) {
        throw new NotFoundException(
          `Stock Import with ID ${stockImportId} not found`,
        );
      }
      stockImportItem.stockImport = stockImport;
    }

    Object.assign(stockImportItem, rest);
    return await this.stockImportItemRepo.save(stockImportItem);
  }

  // Xóa Stock Import Item
  async remove(id: string) {
    const result = await this.stockImportItemRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
    }
    return { message: 'Stock Import Item deleted successfully' };
  }

  async restore(id: string) {
    const result = await this.stockImportItemRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stock Import Item with ID ${id} not found`);
    }
    return this.findOne(id);
  }
}
