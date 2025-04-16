import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  CASH = 'cash',
  VNPAY = 'vnpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @ApiProperty({
    description: 'Unique identifier for the payment (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ApiProperty({
    description: 'Reference to the order associated with the payment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'varchar', length: 36 })
  orderId: string;

  @ApiProperty({
    description: 'Reference to the transaction ID (if applicable)',
    example: 1234567890,
  })
  @Column({ type: 'bigint', nullable: true })
  transactionId: number | null;

  @ApiProperty({
    description: 'Total amount for the payment',
    example: 50000.0,
  })
  @Column('decimal', { precision: 8, scale: 2 })
  totalAmount: number;

  @ApiProperty({
    description: 'Payment method used for the transaction',
    example: 'cash',
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    example: 'pending',
  })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Timestamp when the payment was created',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the payment was last updated',
    type: Date,
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Reference to the order associated with the payment',
    type: () => Order,
  })
  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}