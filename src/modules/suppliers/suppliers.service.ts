import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  //CRUD
  create(requestBody: CreateSupplierDto) {
    const supplier = this.supplierRepo.create(requestBody);
    return this.supplierRepo.save(supplier);
  }

  findAll() {
    return this.supplierRepo.find();
  }

  async findById(id: number) {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async updateById(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Kiểm tra trùng số điện thoại hoặc email (loại trừ chính nó)
    const conflictSupplier = await this.supplierRepo.findOne({
      where: [
        { phone: updateSupplierDto.phone, id: Not(id) },
        { email: updateSupplierDto.email, id: Not(id) },
      ],
    });

    if (conflictSupplier) {
      if (conflictSupplier.phone === updateSupplierDto.phone) {
        throw new ConflictException(
          `Phone number ${updateSupplierDto.phone} already exists`,
        );
      }
      if (conflictSupplier.email === updateSupplierDto.email) {
        throw new ConflictException(
          `Email ${updateSupplierDto.email} already exists`,
        );
      }
    }
    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepo.save(supplier);
  }

  deleteById(id: number) {
    return this.supplierRepo.delete(id);
  }

  async restore(id: number) {
    const result = await this.supplierRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return this.findById(id);
  }
}
