import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drink } from './entities/drink.entity';

@Injectable()
export class DrinksService {
  constructor(
    @InjectRepository(Drink)
    private drinksRepository: Repository<Drink>,
  ) {}

  async create(createDrinkDto: CreateDrinkDto): Promise<Drink> {
    const drink = this.drinksRepository.create(createDrinkDto);
    return this.drinksRepository.save(drink);
  }

  async findAll(): Promise<Drink[]> {
    return this.drinksRepository.find();
  }

  async findOne(id: number): Promise<Drink> {
    const drink = await this.drinksRepository.findOne({
      where: { id },
      relations: ['recipes', 'orderItems'],
    });

    if (!drink) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${id}`);
    }

    return drink;
  }

  async update(id: number, updateDrinkDto: UpdateDrinkDto): Promise<Drink> {
    const drink = await this.findOne(id);

    Object.assign(drink, updateDrinkDto);

    return this.drinksRepository.save(drink);
  }

  async remove(id: number): Promise<void> {
    const result = await this.drinksRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${id}`);
    }
  }
}
