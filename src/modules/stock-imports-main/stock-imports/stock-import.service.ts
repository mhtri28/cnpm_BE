import { Injectable, NotFoundException } from '@nestjs/common';
import { StockImport } from '../entities/stock-import.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
import { UpdateStockImportDto } from '../dto/update-stock-import.dto';
import { Employee } from '../../employees/entities/employee.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
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
  ) {}

  // Tạo Stock Import
  async create(createStockImportDto: CreateStockImportDto) {
    const { employeeId, supplierId, ...rest } = createStockImportDto;

    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const stockImport = this.stockImportRepo.create({
      id: uuidv4(),
      ...rest,
      employee,
      supplier,
    });
    return await this.stockImportRepo.save(stockImport);
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
