import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepo: Repository<Recipe>,
  ) {}

  create(createRecipeDto: CreateRecipeDto) {
    const recipe = this.recipeRepo.create(createRecipeDto);
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

  async updateById(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findById(id);
    Object.assign(recipe, updateRecipeDto);
    return this.recipeRepo.save(recipe);
  }

  async deleteById(id: number) {
    const recipe = await this.findById(id);
    return this.recipeRepo.remove(recipe);
  }
} 