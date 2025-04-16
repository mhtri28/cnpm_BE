import { Injectable, NotFoundException } from '@nestjs/common';
import { StockImport } from '../entities/stock-import.entity';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
import { UpdateStockImportDto } from '../dto/update-stock-import.dto';
import { Employee } from '../../employees/entities/employee.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { StockImportItem } from '../entities/stock-import-item.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockImportService {
  constructor(
    @InjectRepository(StockImport)
    private readonly stockImportRepo: Repository<StockImport>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  // Tạo Stock Import
  async create(createStockImportDto: CreateStockImportDto) {
    const { employeeId, supplierId, stockImportItems, ...rest } =
      createStockImportDto;

    // Check employee exists
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check supplier exists
    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    // Create stock import
    const stockImport = this.stockImportRepo.create({
      id: uuidv4(),
      ...rest,
      employee,
      supplier,
      totalCost: 0, // Initialize totalCost
    });
    const savedStockImport = await this.stockImportRepo.save(stockImport);

    let totalCost = 0;
    // Create stock import items if provided
    if (stockImportItems && stockImportItems.length > 0) {
      const stockImportItemRepo =
        this.dataSource.getRepository(StockImportItem);
      const ingredientRepo = this.dataSource.getRepository(Ingredient);

      for (const item of stockImportItems) {
        const ingredient = await ingredientRepo.findOne({
          where: { id: item.ingredientId },
        });
        if (!ingredient) {
          throw new NotFoundException(
            `Ingredient with ID ${item.ingredientId} not found`,
          );
        }

        const subTotal = item.unitPrice * item.quantity;
        totalCost += subTotal;

        const stockImportItem = stockImportItemRepo.create({
          ingredient,
          stockImport: savedStockImport, // Use the relation instead of just ID
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subTotal: subTotal,
        });
        await stockImportItemRepo.save(stockImportItem);

        // Update ingredient available count
        ingredient.availableCount += item.quantity;
        await ingredientRepo.save(ingredient);
      }

      // Update total cost
      savedStockImport.totalCost = totalCost;
      await this.stockImportRepo.save(savedStockImport);
    }

    return this.findOne(savedStockImport.id);
  }

  // Lấy tất cả các Stock Import
  async findAll() {
    return await this.stockImportRepo.find({
      relations: ['supplier', 'stockImportItems', 'employee'],
    });
  }

  // Lấy một Stock Import theo ID
  async findOne(id: string) {
    const stockImport = await this.stockImportRepo.findOne({
      where: { id },
      relations: ['supplier', 'stockImportItems', 'employee'],
    });
    if (!stockImport)
      throw new NotFoundException(`Stock Import with ID ${id} not found`);
    return stockImport;
  }

  // Cập nhật Stock Import
  async update(id: string, updateStockImportDto: UpdateStockImportDto) {
    const { employeeId, supplierId, ...rest } = updateStockImportDto;

    const stockImport = await this.stockImportRepo.findOne({
      where: { id },
      relations: ['supplier', 'stockImportItems', 'employee'],
    });
    if (!stockImport) {
      throw new NotFoundException(`Stock Import with ID ${id} not found`);
    }

    if (employeeId) {
      const employee = await this.employeeRepo.findOne({
        where: { id: employeeId },
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      stockImport.employee = employee;
    }

    if (supplierId) {
      const supplier = await this.supplierRepo.findOne({
        where: { id: supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
      }
      stockImport.supplier = supplier;
    }

    Object.assign(stockImport, rest);
    return await this.stockImportRepo.save(stockImport);
  }

  // Xóa Stock Import
  async remove(id: string) {
    const result = await this.stockImportRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stock Import with ID ${id} not found`);
    }
    return { message: 'Stock Import deleted successfully' };
  }

  async restore(id: string) {
    const result = await this.stockImportRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stock Import with ID ${id} not found`);
    }
    return this.findOne(id);
  }
}
