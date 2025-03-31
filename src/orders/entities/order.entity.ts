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

  @Column({ name: 'table_number' })
  tableNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'waiter_id' })
  waiter: User;  // Nhân viên phục vụ

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bartender_id' })
  bartender: User;  // Nhân viên pha chế

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ... các trường khác
}
