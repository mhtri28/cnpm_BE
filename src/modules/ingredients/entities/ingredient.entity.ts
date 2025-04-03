import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { StockImportItem } from '../../stock-imports/entities/stock-import-item.entity';


@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  availableCount: number;

  @Column()
  supplierId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @ManyToOne(() => Supplier, supplier => supplier.ingredients)
  // @JoinColumn({ name: 'supplierId' })
  // supplier: Supplier;

  @OneToMany(() => Recipe, recipe => recipe.ingredient)
  recipes: Recipe[];

  @OneToMany(() => StockImportItem, stockImportItem => stockImportItem.ingredient)
  stockImportItems: StockImportItem[];
}
