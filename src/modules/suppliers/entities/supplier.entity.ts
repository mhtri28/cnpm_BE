import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from '../../stock-imports/entities/stock-import.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Ingredient, ingredient => ingredient.supplier)
  ingredients: Ingredient[];

  @OneToMany(() => StockImport, stockImport => stockImport.supplier)
  stockImports: StockImport[];
}
