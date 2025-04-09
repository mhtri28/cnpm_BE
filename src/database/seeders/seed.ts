import AppDataSource from '../../../ormconfig';
import {
  Employee,
  EmployeeRole,
} from '../../modules/employees/entities/employee.entity';
import { Supplier } from '../../modules/suppliers/entities/supplier.entity';
import { Ingredient } from '../../modules/ingredients/entities/ingredient.entity';
import { Drink } from '../../modules/drinks/entities/drink.entity';
import { Recipe } from '../../modules/recipes/entities/recipe.entity';
import { StockImport } from '../../modules/stock-imports-main/entities/stock-import.entity';
import { StockImportItem } from '../../modules/stock-imports-main/entities/stock-import-item.entity';
import { Table } from '../../modules/tables/entities/table.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    await AppDataSource.initialize();

    // Repositories
    const employeeRepository = AppDataSource.getRepository(Employee);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const ingredientRepository = AppDataSource.getRepository(Ingredient);
    const drinkRepository = AppDataSource.getRepository(Drink);
    const recipeRepository = AppDataSource.getRepository(Recipe);
    const stockImportRepository = AppDataSource.getRepository(StockImport);
    const stockImportItemRepository =
      AppDataSource.getRepository(StockImportItem);
    const tableRepository = AppDataSource.getRepository(Table);

    // 1. Tạo nhân viên
    const defaultPassword = await bcrypt.hash('password123', 10);

    await employeeRepository.save({
      name: 'Admin User',
      email: 'admin@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.ADMIN,
    });

    await employeeRepository.save({
      name: 'Barista User',
      email: 'barista@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.BARISTA,
    });

    const inventoryManager = await employeeRepository.save({
      name: 'Inventory Manager',
      email: 'inventory@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.INVENTORY_MANAGER,
    });

    // 2. Tạo bàn
    await tableRepository.save({
      id: uuidv4(),
      name: 'Bàn 1',
    });

    await tableRepository.save({
      id: uuidv4(),
      name: 'Bàn 2',
    });

    await tableRepository.save({
      id: uuidv4(),
      name: 'Bàn 3',
    });

    // 3. Tạo nhà cung cấp
    const supplier1 = await supplierRepository.save({
      name: 'Coffee Bean Supplier',
      phone: '0987654321',
      email: 'beans@supplier.com',
      address: '123 Coffee Street, City',
    });

    const supplier2 = await supplierRepository.save({
      name: 'Milk Supplier',
      phone: '0987654322',
      email: 'milk@supplier.com',
      address: '456 Dairy Road, City',
    });

    // 4. Tạo nguyên liệu
    const coffee = await ingredientRepository.save({
      name: 'Coffee Beans',
      availableCount: 1000,
      supplierId: supplier1.id,
    });

    const milk = await ingredientRepository.save({
      name: 'Fresh Milk',
      availableCount: 500,
      supplierId: supplier2.id,
    });

    await ingredientRepository.save({
      name: 'Sugar',
      availableCount: 800,
      supplierId: supplier2.id,
    });

    // 5. Tạo đồ uống
    const americano = await drinkRepository.save({
      name: 'Americano',
      price: 35000,
      soldCount: 0,
    });

    const latte = await drinkRepository.save({
      name: 'Cafe Latte',
      price: 45000,
      soldCount: 0,
    });

    // 6. Tạo công thức
    await recipeRepository.save({
      drinkId: americano.id,
      ingredientId: coffee.id,
      quantity: 15,
    });

    await recipeRepository.save({
      drinkId: latte.id,
      ingredientId: coffee.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: latte.id,
      ingredientId: milk.id,
      quantity: 150,
    });

    // 7. Tạo stock_imports
    const stockImport1 = await stockImportRepository.save({
      employeeId: inventoryManager.id,
      supplierId: supplier1.id,
      totalCost: 1000.0,
    });

    const stockImport2 = await stockImportRepository.save({
      employeeId: inventoryManager.id,
      supplierId: supplier2.id,
      totalCost: 500.0,
    });

    // 8. Tạo stock_import_items
    await stockImportItemRepository.save({
      ingredientId: coffee.id,
      stockImportId: stockImport1.id,
      unitPrice: 10.0,
      quantity: 100,
      subTotal: 1000.0,
    });

    await stockImportItemRepository.save({
      ingredientId: milk.id,
      stockImportId: stockImport2.id,
      unitPrice: 5.0,
      quantity: 100,
      subTotal: 500.0,
    });

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Call the seed function
seed().catch((error) => {
  console.error('Error running seed:', error);
  process.exit(1);
});
