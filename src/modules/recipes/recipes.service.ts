import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Drink } from '../drinks/entities/drink.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepo: Repository<Recipe>,
    @InjectRepository(Drink) private drinkRepo: Repository<Drink>,
    @InjectRepository(Ingredient)
    private ingredientRepo: Repository<Ingredient>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const { drinkId, ingredientId, quantity } = createRecipeDto;

    const drink = await this.drinkRepo.findOne({
      where: { id: drinkId },
    });
    if (!drink) {
      throw new NotFoundException(`Drink with ID ${drinkId} not found`);
    }

    const ingredient = await this.ingredientRepo.findOne({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID ${ingredientId} not found`,
      );
    }

    const recipe = this.recipeRepo.create({
      drink,
      ingredient,
      quantity,
    });

    return this.recipeRepo.save(recipe);
  }

  findAll() {
    return this.recipeRepo.find({
      relations: ['drink', 'ingredient'],
    });
  }

  async findById(id: number) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: ['drink', 'ingredient'],
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return recipe;
  }

  async findByDrinkId(drinkId: number) {
    const recipes = await this.recipeRepo.find({
      where: { drink: { id: drinkId } },
      relations: ['drink', 'ingredient'],
    });

    if (!recipes.length) {
      throw new NotFoundException(
        `No recipes found for drink with ID ${drinkId}`,
      );
    }

    return recipes;
  }

  async updateById(id: number, updateRecipeDto: UpdateRecipeDto) {
    const { drinkId, ingredientId, quantity } = updateRecipeDto;

    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: ['drink', 'ingredient'],
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    if (drinkId) {
      const drink = await this.drinkRepo.findOne({
        where: { id: drinkId },
      });
      if (!drink) {
        throw new NotFoundException(`Drink with ID ${drinkId} not found`);
      }
      recipe.drink = drink;
    }

    if (ingredientId) {
      const ingredient = await this.ingredientRepo.findOne({
        where: { id: ingredientId },
      });
      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${ingredientId} not found`,
        );
      }
      recipe.ingredient = ingredient;
    }

    if (quantity !== undefined) {
      recipe.quantity = quantity;
    }

    // Update ingredient's availableCount
    if (ingredientId && quantity !== undefined) {
      const ingredient = await this.ingredientRepo.findOne({
        where: { id: ingredientId },
      });
      if (ingredient) {
        ingredient.availableCount = quantity;
        await this.ingredientRepo.save(ingredient);
      }
    }

    return this.recipeRepo.save(recipe);
  }

  async deleteById(id: number) {
    const result = await this.recipeRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return { message: 'Recipe deleted successfully' };
  }

  async restore(id: number) {
    const result = await this.recipeRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return this.findById(id);
  }
}
