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
import { ApiProperty } from '@nestjs/swagger';

export enum EmployeeRole {
  ADMIN = 'admin',
  BARISTA = 'barista',
  INVENTORY_MANAGER = 'inventory_manager',
}

@Entity('employees')
export class Employee {
  @ApiProperty({ description: 'ID của nhân viên', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'Tên đầy đủ của nhân viên',
    example: 'Nguyễn Văn A',
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại của nhân viên',
    example: '0912345678',
  })
  @Column({ length: 10, unique: true })
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({
    description: 'Địa chỉ email của nhân viên',
    example: 'nhanvien@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Vai trò của nhân viên',
    enum: EmployeeRole,
    example: EmployeeRole.BARISTA,
  })
  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.BARISTA,
  })
  role: EmployeeRole;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'Ngày tạo', example: '2023-04-05T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2023-04-06T00:00:00.000Z',
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({ description: 'Ngày xóa (soft delete)', example: null })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => StockImport, (stockImport) => stockImport.employee)
  stockImports: StockImport[];

  @OneToMany(() => Order, (order) => order.employee)
  orders: Order[];
}
