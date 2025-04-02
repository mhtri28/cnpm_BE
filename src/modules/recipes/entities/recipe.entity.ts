import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Drink } from '../../drinks/entities/drink.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  drinkId: number;

  @Column()
  ingredientId: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Drink, drink => drink.recipes)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;

  @ManyToOne(() => Ingredient, ingredient => ingredient.recipes)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
