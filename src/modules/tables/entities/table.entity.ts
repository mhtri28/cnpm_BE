import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tables')
export class Table {
  @ApiProperty({
    description: 'ID của bàn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'varchar', length: 36, unique: true })
  @PrimaryColumn()
  id: string;

  @ApiProperty({
    description: 'Tên của bàn',
    example: 'Bàn 1',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Thời gian tạo lúc',
    example: '2023-04-01T08:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật gần nhất lúc',
    example: '2023-04-15T10:45:00Z',
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thời gian xóa lúc',
    example: null,
  })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty({
    description: 'Đơn đặt từ bàn',
    type: () => Order,
    isArray: true,
  })
  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];

  @ApiProperty({
    description: 'Cho biết bàn có đơn đặt chưa hoàn thành hay không',
    example: true,
  })
  hasActiveOrder: boolean;
}
