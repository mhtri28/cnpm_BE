import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../../../ormconfig';
import { Employee, EmployeeRole } from '../../modules/employees/entities/employee.entity';
import { Supplier } from '../../modules/suppliers/entities/supplier.entity';
import { Ingredient } from '../../modules/ingredients/entities/ingredient.entity';
import { Drink } from '../../modules/drinks/entities/drink.entity';
import { Recipe } from '../../modules/recipes/entities/recipe.entity';
import { Order, OrderStatus } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../../modules/payments/entities/payment.entity';
import { StockImport } from '../../modules/stock-imports/entities/stock-import.entity';
import { StockImportItem } from '../../modules/stock-imports/entities/stock-import-item.entity';

async function seed() {
  try {
    await AppDataSource.initialize();

    // Repositories
    const employeeRepository = AppDataSource.getRepository(Employee);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const ingredientRepository = AppDataSource.getRepository(Ingredient);
    const drinkRepository = AppDataSource.getRepository(Drink);
    const recipeRepository = AppDataSource.getRepository(Recipe);

    // 1. Tạo nhân viên
    const defaultPassword = await bcrypt.hash('password123', 10);

    const admin = await employeeRepository.save({
      name: 'Admin User',
      email: 'admin@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.ADMIN
    });

    const barista = await employeeRepository.save({
      name: 'Barista User',
      email: 'barista@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.BARISTA
    });

    const inventoryManager = await employeeRepository.save({
      name: 'Inventory Manager',
      email: 'inventory@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.INVENTORY_MANAGER
    });

    // 2. Tạo nhà cung cấp
    const supplier1 = await supplierRepository.save({
      name: 'Coffee Bean Supplier',
      phone: '0987654321',
      email: 'beans@supplier.com',
      address: '123 Coffee Street, City'
    });

    const supplier2 = await supplierRepository.save({
      name: 'Milk Supplier',
      phone: '0987654322',
      email: 'milk@supplier.com',
      address: '456 Dairy Road, City'
    });

    // 3. Tạo nguyên liệu
    const coffee = await ingredientRepository.save({
      name: 'Coffee Beans',
      availableCount: 1000,
      supplierId: supplier1.id
    });

    const milk = await ingredientRepository.save({
      name: 'Fresh Milk',
      availableCount: 500,
      supplierId: supplier2.id
    });

    const sugar = await ingredientRepository.save({
      name: 'Sugar',
      availableCount: 800,
      supplierId: supplier2.id
    });

    // 4. Tạo đồ uống
    const americano = await drinkRepository.save({
      name: 'Americano',
      price: 35000,
      soldCount: 0
    });

    const latte = await drinkRepository.save({
      name: 'Cafe Latte',
      price: 45000,
      soldCount: 0
    });

    // 5. Tạo công thức
    await recipeRepository.save({
      drinkId: americano.id,
      ingredientId: coffee.id,
      quantity: 15
    });

    await recipeRepository.save({
      drinkId: latte.id,
      ingredientId: coffee.id,
      quantity: 10
    });

    await recipeRepository.save({
      drinkId: latte.id,
      ingredientId: milk.id,
      quantity: 150
    });

    console.log('Seeding completed successfully');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
