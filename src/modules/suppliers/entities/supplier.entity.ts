import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from '../../stock-imports-main/entities/stock-import.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'suppliers' })
export class Supplier {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10, unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 50 })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => StockImport, (stockImport) => stockImport.supplier)
  stockImports: StockImport[];

  @OneToMany('Ingredient', 'supplier')
  ingredients: Ingredient[];
}
