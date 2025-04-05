import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { StockImportItem } from './stock-import-item.entity';

@Entity('stock_imports')
export class StockImport {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  employeeId: number;

  @Column({ type: 'bigint', unsigned: true })
  supplierId: number;

  @Column('decimal', { precision: 8, scale: 2 })
  totalCost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => Supplier, (supplier) => supplier.stockImports)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(
    () => StockImportItem,
    (stockImportItem) => stockImportItem.stockImport,
  )
  stockImportItems: StockImportItem[];
}
