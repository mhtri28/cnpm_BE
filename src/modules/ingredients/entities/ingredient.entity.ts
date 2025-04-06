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
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { StockImportItem } from '../../stock-imports-main/entities/stock-import-item.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'bigint' })
  availableCount: number;

  @Column({ type: 'bigint', unsigned: true })
  supplierId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Supplier, (supplier) => supplier.ingredients)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => Recipe, (recipe) => recipe.ingredient)
  recipes: Recipe[];

  @OneToMany(
    () => StockImportItem,
    (stockImportItem) => stockImportItem.ingredient,
  )
  stockImportItems: StockImportItem[];
}
