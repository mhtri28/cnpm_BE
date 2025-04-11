import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Table } from '../../tables/entities/table.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PREPARING = 'preparing',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ApiProperty({
    description: 'Reference to the employee who created the order',
    example: 1,
  })
  @Column({ type: 'bigint', unsigned: true })
  employeeId: number;

  @ApiProperty({
    description: 'Reference to the table associated with the order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'varchar', length: 36, nullable: true })
  tableId: string;

  @ApiProperty({
    description: 'Total amount for the order',
    example: 50000.0,
  })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    type: Date,
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Reference to the employee who created the order',
    type: () => Employee,
  })
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({
    description: 'Reference to the table associated with the order',
    type: () => Table,
  })
  @ManyToOne(() => Table)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @ApiProperty({
    description: 'List of items in the order',
    type: () => OrderItem,
  })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @ApiProperty({
    description: 'Payment information for the order',
    type: () => Payment,
  })
  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;
}
