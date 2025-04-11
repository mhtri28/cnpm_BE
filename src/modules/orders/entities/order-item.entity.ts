import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Drink } from '../../drinks/entities/drink.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({
    description: 'Unique identifier for the order item (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ApiProperty({
    description: 'Reference to the parent order (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'varchar', length: 36 })
  orderId: string;

  @ApiProperty({
    description: 'Reference to the drink being ordered',
    example: 1,
  })
  @Column({ type: 'bigint', unsigned: true })
  drinkId: number;

  @ApiProperty({
    description: 'Price of the drink at the time of order',
    example: 25000.0,
  })
  @Column('decimal', { precision: 8, scale: 2 })
  priceAtOrder: number;

  @ApiProperty({
    description: 'Quantity of drinks ordered',
    example: 2,
  })
  @Column({ type: 'bigint' })
  quantity: number;

  @ApiProperty({
    description: 'Subtotal for this order item (price × quantity)',
    example: 50000.0,
  })
  @Column('decimal', { precision: 8, scale: 2 })
  subTotal: number;

  @ApiProperty({
    description: 'The parent order this item belongs to',
    type: () => Order,
  })
  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    description: 'The drink being ordered',
    type: () => Drink,
  })
  @ManyToOne(() => Drink, (drink) => drink.orderItems)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;
}
