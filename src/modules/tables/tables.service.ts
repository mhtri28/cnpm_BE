import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { v4 as uuidv4 } from 'uuid';

// Define DTOs inline for now
interface CreateTableDto {
  name: string;
}

interface UpdateTableDto {
  name?: string;
}

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find();
  }

  async findOne(id: string): Promise<Table | null> {
    return this.tableRepository.findOne({ where: { id } });
  }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = new Table();
    table.id = uuidv4();
    table.name = createTableDto.name;

    return await this.tableRepository.save(table);
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    await this.tableRepository.update(id, updateTableDto);
    const updatedTable = await this.findOne(id);
    if (!updatedTable) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    return updatedTable;
  }

  async remove(id: string): Promise<void> {
    await this.tableRepository.softDelete(id);
  }
}
