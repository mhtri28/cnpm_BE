import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'integer' })
  orderId: number;
}
