import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('drinks')
export class Drink {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column({ default: 0 })
  soldCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Recipe, recipe => recipe.drink)
  recipes: Recipe[];

  @OneToMany(() => OrderItem, orderItem => orderItem.drink)
  orderItems: OrderItem[];
}
