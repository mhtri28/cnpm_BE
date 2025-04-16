import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';  // Add IsNull import
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepo: Repository<Ingredient>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const { name, availableCount, supplierId, unit } = createIngredientDto;

    const supplier = await this.supplierRepo.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    const ingredient = this.ingredientRepo.create({
      name,
      availableCount,
      unit,
      supplier,
    });

    return this.ingredientRepo.save(ingredient);
  }

  findAll() {
    return this.ingredientRepo.find({
      relations: ['supplier'],
    });
  }

  findAllDeleted() {
    return this.ingredientRepo.find({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull())
      }
    });
  }

  async findById(id: number) {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id },
      relations: ['supplier'],
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with id ${id} not found`);
    }
    return ingredient;
  }

  async updateById(id: number, updateIngredientDto: UpdateIngredientDto) {
    const { name, availableCount, supplierId, unit } = updateIngredientDto;

    const ingredient = await this.ingredientRepo.findOne({
      where: { id },
      relations: ['supplier'],
    });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with id ${id} not found`);
    }

    if (name !== undefined) {
      ingredient.name = name;
    }

    if (availableCount !== undefined) {
      ingredient.availableCount = availableCount;
    }

    if (unit !== undefined) {
      ingredient.unit = unit;
    }

    if (supplierId) {
      const supplier = await this.supplierRepo.findOne({
        where: { id: supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
      }
      ingredient.supplier = supplier;
    }

    return this.ingredientRepo.save(ingredient);
  }

  async deleteById(id: number) {
    const result = await this.ingredientRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return { message: 'Ingredient deleted successfully' };
  }
  async restore(id: number) {
    const result = await this.ingredientRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return this.findById(id);
  }
}
