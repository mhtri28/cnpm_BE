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

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOMO = 'momo',
  ZALO_PAY = 'zalo_pay',
  VNPAY = 'vnpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  orderId: string;

  @Column({ type: 'bigint', nullable: true })
  transactionId: number | null;

  @Column('decimal', { precision: 8, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
