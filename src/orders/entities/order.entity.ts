import { User } from "../../users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',           // Mới tạo
  PREPARING = 'preparing',       // Đang pha chế
  READY = 'ready',              // Đã pha chế xong
  DELIVERED = 'delivered',       // Đã giao cho khách
  CANCELLED = 'cancelled'        // Đã hủy
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'waiterId' })
  waiter: User;  // Nhân viên phục vụ

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bartenderId' })
  bartender: User;  // Nhân viên pha chế

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ... các trường khác
}
