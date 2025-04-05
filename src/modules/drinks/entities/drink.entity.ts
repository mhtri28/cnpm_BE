import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('drinks')
export class Drink {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'bigint', default: 0 })
  soldCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => Recipe, (recipe) => recipe.drink)
  recipes: Recipe[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.drink)
  orderItems: OrderItem[];
}
