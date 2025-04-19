import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Table } from './entities/table.entity';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../orders/entities/order.entity';

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
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Table[]> {
    const tables = await this.tableRepository.find();

    // Tối ưu hóa: Lấy tất cả tableIds có đơn hàng đang hoạt động trong một truy vấn duy nhất
    const tablesWithActiveOrders = await this.getTablesWithActiveOrders();

    // Đánh dấu các bàn có đơn hàng đang hoạt động
    for (const table of tables) {
      table.hasActiveOrder = tablesWithActiveOrders.includes(table.id);
    }

    return tables;
  }

  async findOne(id: string): Promise<Table | null> {
    const table = await this.tableRepository.findOne({ where: { id } });

    if (table) {
      // Vẫn sử dụng hasActiveOrder cho trường hợp này vì chỉ kiểm tra một bàn
      table.hasActiveOrder = await this.hasActiveOrder(id);
    }

    return table;
  }

  private async getTablesWithActiveOrders(): Promise<string[]> {
    // Truy vấn lấy tất cả các bàn có đơn hàng đang hoạt động (PAID hoặc PREPARING)
    const activeOrdersQuery = await this.orderRepository
      .createQueryBuilder('order')
      .select('DISTINCT order.tableId')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.PREPARING],
      })
      .getRawMany();

    // Trích xuất tableIds từ kết quả truy vấn
    return activeOrdersQuery.map(
      (item: { order_tableId: string }) => item.order_tableId,
    );
  }

  private async hasActiveOrder(tableId: string): Promise<boolean> {
    const count = await this.orderRepository.count({
      where: {
        tableId,
        status: In([OrderStatus.PAID, OrderStatus.PREPARING]),
      },
    });

    return count > 0;
  }

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = new Table();
    table.id = uuidv4();
    table.name = createTableDto.name;
    table.hasActiveOrder = false;

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
