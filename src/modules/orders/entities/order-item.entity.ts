import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Drink } from '../../drinks/entities/drink.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  orderId: number;

  @Column()
  drinkId: number;

  @Column('decimal', { precision: 8, scale: 2 })
  priceAtOrder: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 8, scale: 2 })
  subTotal: number;

  @ManyToOne(() => Order, order => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Drink, drink => drink.orderItems)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;
}
