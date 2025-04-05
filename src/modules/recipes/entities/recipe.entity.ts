import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Drink } from '../../drinks/entities/drink.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  drinkId: number;

  @Column({ type: 'bigint', unsigned: true })
  ingredientId: number;

  @Column({ type: 'bigint' })
  quantity: number;

  @ManyToOne(() => Drink, (drink) => drink.recipes)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipes)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
