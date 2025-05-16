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
import { Order, OrderStatus } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../../modules/payments/entities/payment.entity';
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
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // 1. Tạo nhân viên
    const defaultPassword = await bcrypt.hash('password123', 10);

    const admin = await employeeRepository.save({
      name: 'Admin User',
      email: 'admin@coffee.com',
      phone: '0123456789',
      password: defaultPassword,
      role: EmployeeRole.ADMIN,
    });

    const barista = await employeeRepository.save({
      name: 'Barista User',
      email: 'barista@coffee.com',
      phone: '0123456781',
      password: defaultPassword,
      role: EmployeeRole.BARISTA,
    });

    const inventoryManager = await employeeRepository.save({
      name: 'Inventory Manager',
      email: 'inventory@coffee.com',
      phone: '0123456782',
      password: defaultPassword,
      role: EmployeeRole.INVENTORY_MANAGER,
    });

    // 2. Tạo bàn
    console.log('Seeding tables...');
    const tables: Table[] = [];

    for (let i = 1; i <= 15; i++) {
      tables.push(
        await tableRepository.save({
          id: uuidv4(),
          name: `Bàn ${i}`,
        }),
      );
    }

    // 3. Tạo nhà cung cấp
    console.log('Seeding suppliers...');
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

    const supplier3 = await supplierRepository.save({
      name: 'Tea & Spices Supplier',
      phone: '0987654323',
      email: 'tea@supplier.com',
      address: '789 Tea Avenue, City',
    });

    const supplier4 = await supplierRepository.save({
      name: 'Syrup & Flavors Supplier',
      phone: '0987654324',
      email: 'flavors@supplier.com',
      address: '101 Flavor Boulevard, City',
    });

    // 4. Tạo nguyên liệu
    console.log('Seeding ingredients...');
    const coffee = await ingredientRepository.save({
      name: 'Coffee Beans',
      availableCount: 1000.5,
      unit: 'gram',
      supplierId: supplier1.id,
    });

    const milk = await ingredientRepository.save({
      name: 'Fresh Milk',
      availableCount: 5000,
      unit: 'ml',
      supplierId: supplier2.id,
    });

    const sugar = await ingredientRepository.save({
      name: 'Sugar',
      availableCount: 8000,
      unit: 'gram',
      supplierId: supplier2.id,
    });

    const tea = await ingredientRepository.save({
      name: 'Black Tea',
      availableCount: 3000,
      unit: 'gram',
      supplierId: supplier3.id,
    });

    const greenTea = await ingredientRepository.save({
      name: 'Green Tea',
      availableCount: 2500,
      unit: 'gram',
      supplierId: supplier3.id,
    });

    const chocolate = await ingredientRepository.save({
      name: 'Chocolate Powder',
      availableCount: 2000,
      unit: 'gram',
      supplierId: supplier4.id,
    });

    const vanillaSyrup = await ingredientRepository.save({
      name: 'Vanilla Syrup',
      availableCount: 1500,
      unit: 'ml',
      supplierId: supplier4.id,
    });

    const caramelSyrup = await ingredientRepository.save({
      name: 'Caramel Syrup',
      availableCount: 1500,
      unit: 'ml',
      supplierId: supplier4.id,
    });

    const whippedCream = await ingredientRepository.save({
      name: 'Whipped Cream',
      availableCount: 2000,
      unit: 'gram',
      supplierId: supplier2.id,
    });

    const iceCubes = await ingredientRepository.save({
      name: 'Ice Cubes',
      availableCount: 10000,
      unit: 'gram',
      supplierId: supplier2.id,
    });

    const lemonJuice = await ingredientRepository.save({
      name: 'Lemon Juice',
      availableCount: 1000,
      unit: 'ml',
      supplierId: supplier3.id,
    });

    const mintLeaves = await ingredientRepository.save({
      name: 'Mint Leaves',
      availableCount: 500,
      unit: 'gram',
      supplierId: supplier3.id,
    });

    // 5. Tạo đồ uống
    console.log('Seeding drinks...');
    const fakeImageUrl = 'https://example.com/coffee-image.jpg';

    // Create drinks with explicit column names
    const americano = await drinkRepository.save({
      name: 'Americano',
      image_url:
        'https://www.thespruceeats.com/thmb/XUYpKtgCFv8dOkzA0vDIroWu6Bs=/3089x2060/filters:fill(auto,1)/85153452-56a176765f9b58b7d0bf84dd.jpg',
      price: 35000,
      soldCount: 0,
    });

    const latte = await drinkRepository.save({
      name: 'Cafe Latte',
      image_url:
        'https://tse3.mm.bing.net/th/id/OIP.smcR0io__Ne1B6JFjfWPhwHaLH?rs=1&pid=ImgDetMain',
      price: 45000,
      soldCount: 0,
    });

    const cappuccino = await drinkRepository.save({
      name: 'Cappuccino',
      image_url:
        'https://th.bing.com/th/id/R.da39668e8d00c9a6895755ebdad865ec?rik=pgjutCTYQ9I95w&pid=ImgRaw&r=0',
      price: 48000,
      soldCount: 0,
    });

    const espresso = await drinkRepository.save({
      name: 'Espresso',
      image_url:
        'https://www.tasteofhome.com/wp-content/uploads/2023/03/TOH-espresso-GettyImages-1291298315-JVcrop.jpg',
      price: 30000,
      soldCount: 0,
    });

    const mocha = await drinkRepository.save({
      name: 'Cafe Mocha',
      image_url:
        'https://th.bing.com/th/id/R.54d9dc601c99e0cd83ba5c0cafd98dfb?rik=PtuNPqmENN2tyg&riu=http%3a%2f%2fwww.folgerscoffee.com%2ffolgers%2frecipes%2f_Hero+Images%2fDetail+Pages%2f6330%2fimage-thumb__6330__schema_image%2fCafeMocha-hero.61028a28.jpg&ehk=xAEc5kLat5',
      price: 50000,
      soldCount: 0,
    });

    const blackTea = await drinkRepository.save({
      name: 'Black Tea',
      image_url:
        'https://th.bing.com/th/id/R.e6c6dc2e38801bbfa422ea42b50c4f81?rik=bXSu5lRHzOOsLw&pid=ImgRaw&r=0',
      price: 32000,
      soldCount: 0,
    });

    const greenTeaLatte = await drinkRepository.save({
      name: 'Green Tea Latte',
      image_url:
        'https://th.bing.com/th/id/R.a0924cfec145be652100986521ff4901?rik=h8aim3a1ZkR1wA&pid=ImgRaw&r=0',
      price: 45000,
      soldCount: 0,
    });

    const hotChocolate = await drinkRepository.save({
      name: 'Hot Chocolate',
      image_url:
        'https://th.bing.com/th/id/R.0ee6f115032435cc5439522763845b16?rik=HrwotZOSPmfmsg&pid=ImgRaw&r=0',
      price: 42000,
      soldCount: 0,
    });

    const vanillaLatte = await drinkRepository.save({
      name: 'Vanilla Latte',
      image_url:
        'https://th.bing.com/th/id/R.0ee6f115032435cc5439522763845b16?rik=HrwotZOSPmfmsg&pid=ImgRaw&r=0',
      price: 50000,
      soldCount: 0,
    });

    const caramelMacchiato = await drinkRepository.save({
      name: 'Caramel Macchiato',
      image_url:
        'https://tse1.mm.bing.net/th/id/OIP.-onsxiz4Fk4u4QLnKmIUKgHaLH?rs=1&pid=ImgDetMain',
      price: 55000,
      soldCount: 0,
    });

    const icedCoffee = await drinkRepository.save({
      name: 'Iced Coffee',
      image_url:
        'https://www.windingcreekranch.org/wp-content/uploads/2022/05/Homemade-iced-coffee-1200-1200.jpg',
      price: 38000,
      soldCount: 0,
    });

    const lemonTea = await drinkRepository.save({
      name: 'Lemon Tea',
      image_url:
        'https://th.bing.com/th/id/R.59b3e29ac3647f048b93abc4f2a186db?rik=RZIcYRexu6Okeg&pid=ImgRaw&r=0',
      price: 35000,
      soldCount: 0,
    });

    const mintMojito = await drinkRepository.save({
      name: 'Mint Mojito Coffee',
      image_url:
        'https://th.bing.com/th/id/R.6412df81f688572a723ef2b8e0034e7c?rik=GuEAOKAQDDwtig&pid=ImgRaw&r=0',
      price: 52000,
      soldCount: 0,
    });

    // 6. Tạo công thức
    console.log('Seeding recipes...');
    // Americano
    await recipeRepository.save({
      drinkId: americano.id,
      ingredientId: coffee.id,
      quantity: 15,
    });

    await recipeRepository.save({
      drinkId: americano.id,
      ingredientId: sugar.id,
      quantity: 5,
    });

    // Latte
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

    await recipeRepository.save({
      drinkId: latte.id,
      ingredientId: sugar.id,
      quantity: 10,
    });

    // Cappuccino
    await recipeRepository.save({
      drinkId: cappuccino.id,
      ingredientId: coffee.id,
      quantity: 12,
    });

    await recipeRepository.save({
      drinkId: cappuccino.id,
      ingredientId: milk.id,
      quantity: 100,
    });

    await recipeRepository.save({
      drinkId: cappuccino.id,
      ingredientId: sugar.id,
      quantity: 8,
    });

    // Espresso
    await recipeRepository.save({
      drinkId: espresso.id,
      ingredientId: coffee.id,
      quantity: 20,
    });

    // Mocha
    await recipeRepository.save({
      drinkId: mocha.id,
      ingredientId: coffee.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: mocha.id,
      ingredientId: milk.id,
      quantity: 120,
    });

    await recipeRepository.save({
      drinkId: mocha.id,
      ingredientId: chocolate.id,
      quantity: 15,
    });

    await recipeRepository.save({
      drinkId: mocha.id,
      ingredientId: whippedCream.id,
      quantity: 20,
    });

    // Black Tea
    await recipeRepository.save({
      drinkId: blackTea.id,
      ingredientId: tea.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: blackTea.id,
      ingredientId: sugar.id,
      quantity: 8,
    });

    // Green Tea Latte
    await recipeRepository.save({
      drinkId: greenTeaLatte.id,
      ingredientId: greenTea.id,
      quantity: 12,
    });

    await recipeRepository.save({
      drinkId: greenTeaLatte.id,
      ingredientId: milk.id,
      quantity: 150,
    });

    await recipeRepository.save({
      drinkId: greenTeaLatte.id,
      ingredientId: sugar.id,
      quantity: 10,
    });

    // Hot Chocolate
    await recipeRepository.save({
      drinkId: hotChocolate.id,
      ingredientId: chocolate.id,
      quantity: 25,
    });

    await recipeRepository.save({
      drinkId: hotChocolate.id,
      ingredientId: milk.id,
      quantity: 180,
    });

    await recipeRepository.save({
      drinkId: hotChocolate.id,
      ingredientId: whippedCream.id,
      quantity: 20,
    });

    // Vanilla Latte
    await recipeRepository.save({
      drinkId: vanillaLatte.id,
      ingredientId: coffee.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: vanillaLatte.id,
      ingredientId: milk.id,
      quantity: 150,
    });

    await recipeRepository.save({
      drinkId: vanillaLatte.id,
      ingredientId: vanillaSyrup.id,
      quantity: 15,
    });

    // Caramel Macchiato
    await recipeRepository.save({
      drinkId: caramelMacchiato.id,
      ingredientId: coffee.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: caramelMacchiato.id,
      ingredientId: milk.id,
      quantity: 150,
    });

    await recipeRepository.save({
      drinkId: caramelMacchiato.id,
      ingredientId: caramelSyrup.id,
      quantity: 20,
    });

    await recipeRepository.save({
      drinkId: caramelMacchiato.id,
      ingredientId: vanillaSyrup.id,
      quantity: 10,
    });

    // Iced Coffee
    await recipeRepository.save({
      drinkId: icedCoffee.id,
      ingredientId: coffee.id,
      quantity: 15,
    });

    await recipeRepository.save({
      drinkId: icedCoffee.id,
      ingredientId: sugar.id,
      quantity: 12,
    });

    await recipeRepository.save({
      drinkId: icedCoffee.id,
      ingredientId: iceCubes.id,
      quantity: 80,
    });

    // Lemon Tea
    await recipeRepository.save({
      drinkId: lemonTea.id,
      ingredientId: tea.id,
      quantity: 8,
    });

    await recipeRepository.save({
      drinkId: lemonTea.id,
      ingredientId: lemonJuice.id,
      quantity: 20,
    });

    await recipeRepository.save({
      drinkId: lemonTea.id,
      ingredientId: sugar.id,
      quantity: 15,
    });

    // Mint Mojito Coffee
    await recipeRepository.save({
      drinkId: mintMojito.id,
      ingredientId: coffee.id,
      quantity: 12,
    });

    await recipeRepository.save({
      drinkId: mintMojito.id,
      ingredientId: mintLeaves.id,
      quantity: 8,
    });

    await recipeRepository.save({
      drinkId: mintMojito.id,
      ingredientId: sugar.id,
      quantity: 10,
    });

    await recipeRepository.save({
      drinkId: mintMojito.id,
      ingredientId: iceCubes.id,
      quantity: 60,
    });

    // 7. Tạo stock_imports
    console.log('Seeding stock imports...');
    // Nhập hàng từ nhà cung cấp cà phê
    const stockImport1 = await stockImportRepository.save({
      id: uuidv4(),
      employeeId: inventoryManager.id,
      supplierId: supplier1.id,
      totalCost: 2500000,
    });

    // Nhập hàng từ nhà cung cấp sữa
    const stockImport2 = await stockImportRepository.save({
      id: uuidv4(),
      employeeId: inventoryManager.id,
      supplierId: supplier2.id,
      totalCost: 1800000,
    });

    // Nhập hàng từ nhà cung cấp trà
    const stockImport3 = await stockImportRepository.save({
      id: uuidv4(),
      employeeId: inventoryManager.id,
      supplierId: supplier3.id,
      totalCost: 1200000,
    });

    // Nhập hàng từ nhà cung cấp siro
    const stockImport4 = await stockImportRepository.save({
      id: uuidv4(),
      employeeId: inventoryManager.id,
      supplierId: supplier4.id,
      totalCost: 900000,
    });

    // 8. Tạo stock_import_items
    console.log('Seeding stock import items...');
    // Nhập cà phê
    await stockImportItemRepository.save({
      ingredientId: coffee.id,
      stockImportId: stockImport1.id,
      unitPrice: 250,
      quantity: 10000,
      subTotal: 2500000,
    });

    // Nhập sữa và đường
    await stockImportItemRepository.save({
      ingredientId: milk.id,
      stockImportId: stockImport2.id,
      unitPrice: 180,
      quantity: 5000,
      subTotal: 900000,
    });

    await stockImportItemRepository.save({
      ingredientId: sugar.id,
      stockImportId: stockImport2.id,
      unitPrice: 100,
      quantity: 8000,
      subTotal: 800000,
    });

    await stockImportItemRepository.save({
      ingredientId: whippedCream.id,
      stockImportId: stockImport2.id,
      unitPrice: 50,
      quantity: 2000,
      subTotal: 100000,
    });

    // Nhập trà và các nguyên liệu liên quan
    await stockImportItemRepository.save({
      ingredientId: tea.id,
      stockImportId: stockImport3.id,
      unitPrice: 200,
      quantity: 3000,
      subTotal: 600000,
    });

    await stockImportItemRepository.save({
      ingredientId: greenTea.id,
      stockImportId: stockImport3.id,
      unitPrice: 220,
      quantity: 2500,
      subTotal: 550000,
    });

    await stockImportItemRepository.save({
      ingredientId: lemonJuice.id,
      stockImportId: stockImport3.id,
      unitPrice: 50,
      quantity: 1000,
      subTotal: 50000,
    });

    // Nhập siro và các nguyên liệu liên quan
    await stockImportItemRepository.save({
      ingredientId: chocolate.id,
      stockImportId: stockImport4.id,
      unitPrice: 180,
      quantity: 2000,
      subTotal: 360000,
    });

    await stockImportItemRepository.save({
      ingredientId: vanillaSyrup.id,
      stockImportId: stockImport4.id,
      unitPrice: 180,
      quantity: 1500,
      subTotal: 270000,
    });

    await stockImportItemRepository.save({
      ingredientId: caramelSyrup.id,
      stockImportId: stockImport4.id,
      unitPrice: 180,
      quantity: 1500,
      subTotal: 270000,
    });

    // 9. Tạo đơn hàng giả
    console.log('Seeding orders...');
    const drinks = [
      americano,
      latte,
      cappuccino,
      espresso,
      mocha,
      blackTea,
      greenTeaLatte,
      hotChocolate,
      vanillaLatte,
      caramelMacchiato,
      icedCoffee,
      lemonTea,
      mintMojito,
    ];

    // Tạo 50 đơn hàng trong 7 ngày qua
    for (let i = 0; i < 50; i++) {
      const randomTable = tables[Math.floor(Math.random() * tables.length)];
      const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 ly
      const subTotal = randomDrink.price * quantity;
      const orderDate = new Date(
        Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
      );

      // Tạo đơn hàng
      const order = await orderRepository.save({
        id: uuidv4(),
        employeeId: barista.id,
        tableId: randomTable.id,
        status: OrderStatus.COMPLETED,
        createdAt: orderDate,
      });

      // Tạo chi tiết đơn hàng
      await orderItemRepository.save({
        id: uuidv4(),
        orderId: order.id,
        drinkId: randomDrink.id,
        priceAtOrder: randomDrink.price,
        quantity: quantity,
        subTotal: subTotal,
      });

      // Tạo thanh toán
      const paymentMethods = [PaymentMethod.CASH, PaymentMethod.VNPAY];
      const randomMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      await paymentRepository.save({
        id: uuidv4(),
        orderId: order.id,
        transactionId: Math.floor(Math.random() * 1000000),
        totalAmount: subTotal,
        method: randomMethod,
        status: PaymentStatus.COMPLETED,
        createdAt: order.createdAt,
      });

      // Cập nhật số lượng đã bán
      await drinkRepository.update(randomDrink.id, {
        soldCount: randomDrink.soldCount + quantity,
      });
    }

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
