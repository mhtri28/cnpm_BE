import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { SupplierModule } from './modules/suppliers/suppliers.module';
import { Supplier } from './modules/suppliers/entities/supplier.entity';
import { Employee } from './modules/employees/entities/employee.entity';
import { Drink } from './modules/drinks/entities/drink.entity';
import { Ingredient } from './modules/ingredients/entities/ingredient.entity';
import { Order } from './modules/orders/entities/order.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Recipe } from './modules/recipes/entities/recipe.entity';
import { StockImport } from './modules/stock-imports-main/entities/stock-import.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { StockImportItem } from './modules/stock-imports-main/entities/stock-import-item.entity';
import { EmployeesModule } from './modules/employees/employees.module';
import { StockImportsModule } from './modules/stock-imports-main/stock-imports.module';
import { GuardModule } from './guard/guard.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { Table } from './modules/tables/entities/table.entity';
import { TablesModule } from './modules/tables/tables.module';
import { DrinksModule } from './modules/drinks/drinks.module';

config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        Employee,
        Supplier,
        Drink,
        Ingredient,
        Order,
        OrderItem,
        Payment,
        Recipe,
        StockImport,
        StockImportItem,
        Table,
      ],
      synchronize: false,
      logging: true,
    }),
    SupplierModule,
    EmployeesModule,
    StockImportsModule,
    RecipesModule,
    GuardModule,
    IngredientsModule,
    TablesModule,
    DrinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}