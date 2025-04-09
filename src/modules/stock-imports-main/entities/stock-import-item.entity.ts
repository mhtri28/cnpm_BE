import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from './stock-import.entity';

@Entity('stock_import_items')
export class StockImportItem {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'bigint', unsigned: true })
  ingredientId: number;

  @Column({ type: 'varchar', length: 36 })
  stockImportId: string;

  @Column('decimal', { precision: 8, scale: 2 })
  unitPrice: number;

  @Column({ type: 'bigint' })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subTotal: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.stockImportItems)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @ManyToOne(() => StockImport, (stockImport) => stockImport.stockImportItems)
  @JoinColumn({ name: 'stockImportId' })
  stockImport: StockImport;
}
