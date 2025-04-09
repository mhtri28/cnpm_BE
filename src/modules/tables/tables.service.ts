import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find();
  }

  async findOne(id: string): Promise<Table> {
    return this.tableRepository.findOne({ where: { id } });
  }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tableRepository.create({
      id: uuidv4(),
      ...createTableDto,
    });
    return this.tableRepository.save(table);
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    await this.tableRepository.update(id, updateTableDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tableRepository.softDelete(id);
  }
}
