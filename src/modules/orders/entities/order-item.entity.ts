import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Drink } from '../../drinks/entities/drink.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  orderId: string;

  @Column({ type: 'bigint', unsigned: true })
  drinkId: number;

  @Column('decimal', { precision: 8, scale: 2 })
  priceAtOrder: number;

  @Column({ type: 'bigint' })
  quantity: number;

  @Column('decimal', { precision: 8, scale: 2 })
  subTotal: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Drink, (drink) => drink.orderItems)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;
}
