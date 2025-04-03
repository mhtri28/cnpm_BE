import { Ingredient } from "../../ingredients/entities/ingredient.entity";
import { StockImport } from "../../stock-imports/entities/stock-import.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";

@Entity({ name: 'suppliers' })
export class Supplier {
    @PrimaryGeneratedColumn({ type: 'integer', unsigned: true })
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 10, unique: true })
    phone: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: 50 })
    address: string;

    @OneToMany(() => StockImport, stockImport => stockImport.supplier)
    stockImports: StockImport[];

    @OneToMany('Ingredient', 'supplier')
    ingredients: Ingredient[];
}