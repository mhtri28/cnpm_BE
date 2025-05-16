import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not, IsNull } from 'typeorm';
import { Drink } from './entities/drink.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

interface SqlError extends Error {
  code?: string;
  sqlMessage?: string;
}

@Injectable()
export class DrinksService {
  constructor(
    @InjectRepository(Drink)
    private drinksRepository: Repository<Drink>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    private dataSource: DataSource,
  ) {}

  async create(createDrinkDto: CreateDrinkDto): Promise<Drink> {
    const { recipe, ...drinkData } = createDrinkDto;

    // Kiểm tra xem tên đồ uống đã tồn tại chưa (bao gồm cả những đồ uống đã bị xóa mềm)
    const existingDrink = await this.drinksRepository.findOne({
      where: { name: drinkData.name },
      withDeleted: true,
    });

    if (existingDrink) {
      if (existingDrink.deletedAt) {
        // Nếu đồ uống đã bị xóa mềm
        throw new ConflictException(
          `Đồ uống với tên '${drinkData.name}' đã tồn tại nhưng đã bị xóa. Bạn có thể khôi phục đồ uống này thay vì tạo mới.`,
        );
      } else {
        // Nếu đồ uống vẫn còn tồn tại
        throw new ConflictException(
          `Đồ uống với tên '${drinkData.name}' đã tồn tại. Vui lòng chọn tên khác.`,
        );
      }
    }

    // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tạo drink trước
      const drink = this.drinksRepository.create(drinkData);
      const savedDrink = await queryRunner.manager.save(drink);

      // 2. Kiểm tra các nguyên liệu tồn tại
      for (const recipeItem of recipe) {
        const ingredient = await this.ingredientRepository.findOne({
          where: { id: recipeItem.id },
        });

        if (!ingredient) {
          throw new NotFoundException(
            `Không tìm thấy nguyên liệu với ID ${recipeItem.id}`,
          );
        }
      }

      // 3. Tạo các recipe
      const recipeEntities = recipe.map((item) => {
        return this.recipeRepository.create({
          drinkId: savedDrink.id,
          ingredientId: item.id,
          quantity: item.quantity,
        });
      });

      await queryRunner.manager.save(recipeEntities);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về drink đã tạo với recipes
      return this.findOne(savedDrink.id);
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();

      // Xử lý các lỗi cụ thể
      const sqlError = error as SqlError;
      if (
        sqlError.code === 'ER_DUP_ENTRY' &&
        sqlError.sqlMessage?.includes('drinks.IDX')
      ) {
        throw new ConflictException(
          'Tên đồ uống đã tồn tại. Vui lòng chọn tên khác.',
        );
      }

      throw error;
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Drink[]> {
    return this.drinksRepository.find({
      relations: ['recipes', 'recipes.ingredient'],
    });
  }

  async findOne(id: number): Promise<Drink> {
    const drink = await this.drinksRepository.findOne({
      where: { id },
      relations: ['recipes', 'recipes.ingredient', 'orderItems'],
    });

    if (!drink) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${id}`);
    }

    return drink;
  }

  async update(id: number, updateDrinkDto: UpdateDrinkDto): Promise<Drink> {
    const { recipe, ...updateData } = updateDrinkDto;

    // Find the existing drink first
    const existingDrink = await this.drinksRepository.findOne({
      where: { id },
      relations: ['recipes'],
    });

    if (!existingDrink) {
      throw new NotFoundException(`Drink with ID ${id} not found`);
    }

    // Only check for duplicate names if the name is being updated and it's different
    if (updateData.name && updateData.name !== existingDrink.name) {
      const duplicateDrink = await this.drinksRepository.findOne({
        where: { name: updateData.name },
        withDeleted: true,
      });

      if (duplicateDrink) {
        if (duplicateDrink.deletedAt) {
          throw new ConflictException(
            `Drink with name '${updateData.name}' exists but was deleted. You can restore it instead.`,
          );
        } else {
          throw new ConflictException(
            `Drink with name '${updateData.name}' already exists. Please choose a different name.`,
          );
        }
      }
    }

    // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Cập nhật thông tin drink
      const drink = await this.findOne(id);
      Object.assign(drink, updateData); // Changed from drinkData to updateData
      await queryRunner.manager.save(drink);

      // 2. Nếu có cập nhật recipe
      if (recipe && recipe.length > 0) {
        // Kiểm tra các nguyên liệu tồn tại
        for (const recipeItem of recipe) {
          const ingredient = await this.ingredientRepository.findOne({
            where: { id: recipeItem.id },
          });

          if (!ingredient) {
            throw new NotFoundException(
              `Không tìm thấy nguyên liệu với ID ${recipeItem.id}`,
            );
          }
        }

        // Xóa tất cả recipe cũ
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(Recipe)
          .where('drinkId = :drinkId', { drinkId: id })
          .execute();

        // Tạo recipe mới
        const recipeEntities = recipe.map((item) => {
          return this.recipeRepository.create({
            drinkId: id,
            ingredientId: item.id,
            quantity: item.quantity,
          });
        });

        await queryRunner.manager.save(recipeEntities);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về drink đã cập nhật với recipes
      return this.findOne(id);
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();

      // Xử lý các lỗi cụ thể
      const sqlError = error as SqlError;
      if (
        sqlError.code === 'ER_DUP_ENTRY' &&
        sqlError.sqlMessage?.includes('drinks.IDX')
      ) {
        throw new ConflictException(
          'Tên đồ uống đã tồn tại. Vui lòng chọn tên khác.',
        );
      }

      throw error;
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.drinksRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${id}`);
    }
  }

  async getRecipeByDrinkId(drinkId: number): Promise<Partial<Recipe>[]> {
    const drink = await this.findOne(drinkId);

    if (!drink) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${drinkId}`);
    }

    return drink.recipes;
  }

  async findAllDeleted(): Promise<Drink[]> {
    return this.drinksRepository.find({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull()),
      },
      relations: ['recipes', 'recipes.ingredient'],
    });
  }

  async restore(id: number): Promise<Drink> {
    // Kiểm tra xem đồ uống có tồn tại và đã bị xóa chưa
    const drink = await this.drinksRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!drink) {
      throw new NotFoundException(`Không tìm thấy đồ uống với id ${id}`);
    }

    if (!drink.deletedAt) {
      throw new ConflictException(`Đồ uống với id ${id} chưa bị xóa`);
    }

    // Kiểm tra nếu có đồ uống khác đang sử dụng cùng tên
    const existingDrink = await this.drinksRepository.findOne({
      where: { name: drink.name },
    });

    if (existingDrink) {
      throw new ConflictException(
        `Không thể khôi phục đồ uống vì tên '${drink.name}' đã được sử dụng bởi một đồ uống khác. Vui lòng xóa hoặc đổi tên đồ uống đó trước.`,
      );
    }

    // Khôi phục đồ uống
    await this.drinksRepository.restore(id);

    // Trả về đồ uống đã khôi phục
    return this.findOne(id);
  }

  async getAvailableQuantity(id: number): Promise<{
    drinkId: number;
    drinkName: string;
    availableQuantity: number;
  }> {
    // Get the drink with its recipes and ingredients
    const drink = await this.drinksRepository.findOne({
      where: { id },
      relations: ['recipes', 'recipes.ingredient'],
    });

    if (!drink) {
      throw new NotFoundException(`Không tìm thấy đồ uống với ID ${id}`);
    }

    let minAvailableQuantity = Infinity;

    // Calculate how many drinks can be made based on each ingredient
    for (const recipe of drink.recipes) {
      const ingredient = recipe.ingredient;
      if (ingredient.availableCount && recipe.quantity) {
        const possibleDrinks = Math.floor(
          ingredient.availableCount / recipe.quantity,
        );
        minAvailableQuantity = Math.min(minAvailableQuantity, possibleDrinks);
      } else {
        minAvailableQuantity = 0;
        break;
      }
    }

    return {
      drinkId: drink.id,
      drinkName: drink.name,
      availableQuantity:
        minAvailableQuantity === Infinity ? 0 : minAvailableQuantity,
    };
  }
}
