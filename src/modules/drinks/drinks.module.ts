import { Module } from '@nestjs/common';
import { DrinksService } from './drinks.service';
import { DrinksController } from './drinks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drink } from './entities/drink.entity';
import { GuardModule } from '../../guard/guard.module';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drink, Recipe, Ingredient]), GuardModule],
  controllers: [DrinksController],
  providers: [DrinksService],
  exports: [DrinksService],
})
export class DrinksModule {}
