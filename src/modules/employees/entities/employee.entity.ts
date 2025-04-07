import { Exclude } from 'class-transformer';
import { Order } from '../../orders/entities/order.entity';
import { StockImport } from '../../stock-imports-main/entities/stock-import.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { IsPhoneNumber } from 'class-validator';

export enum EmployeeRole {
  ADMIN = 'admin',
  BARISTA = 'barista',
  INVENTORY_MANAGER = 'inventory_manager',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10, unique: true })
  @IsPhoneNumber('VN')
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
  })
  role: EmployeeRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => StockImport, (stockImport) => stockImport.employee)
  stockImports: StockImport[];

  @OneToMany(() => Order, (order) => order.employee)
  orders: Order[];
}
