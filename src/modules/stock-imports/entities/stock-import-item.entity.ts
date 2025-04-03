import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from './stock-import.entity';

@Entity('stock_import_items')
export class StockImportItem {
  @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
  id: number;

  @Column()
  ingredientId: number;

  @Column()
  stockImportId: number;

  @Column('decimal', { precision: 8, scale: 2 })
  unitPrice: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 8, scale: 2 })
  subTotal: number;

  @ManyToOne(() => Ingredient, ingredient => ingredient.stockImportItems)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @ManyToOne(() => StockImport, stockImport => stockImport.stockImportItems)
  @JoinColumn({ name: 'stockImportId' })
  stockImport: StockImport;
}

