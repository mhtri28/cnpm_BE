import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Drink } from '../../drinks/entities/drink.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('recipes')
export class Recipe {
  @ApiProperty({
    description: 'ID của công thức',
    example: 1
  })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'ID của đồ uống',
    example: 1
  })
  @Column({ type: 'bigint', unsigned: true })
  drinkId: number;

  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1
  })
  @Column({ type: 'bigint', unsigned: true })
  ingredientId: number;

  @ApiProperty({
    description: 'Số lượng nguyên liệu cần dùng',
    example: 30
  })
  @Column({ type: 'bigint' })
  quantity: number;

  @ApiProperty({
    description: 'Thông tin đồ uống',
    type: () => Drink
  })
  @ManyToOne(() => Drink, (drink) => drink.recipes)
  @JoinColumn({ name: 'drinkId' })
  drink: Drink;

  @ApiProperty({
    description: 'Thông tin nguyên liệu',
    type: () => Ingredient
  })
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipes)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
