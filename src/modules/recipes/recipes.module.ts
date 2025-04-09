import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { GuardModule } from '../../guard/guard.module';
import { Drink } from '../drinks/entities/drink.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Drink, Ingredient]), GuardModule],
  providers: [RecipesService],
  controllers: [RecipesController],
  exports: [RecipesService],
})
export class RecipesModule {}
