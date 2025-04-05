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
import { StockImport } from './modules/stock-imports/entities/stock-import.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { StockImportItem } from './modules/stock-imports/entities/stock-import-item.entity';
import { StockImportModule } from './modules/stock-imports/stock-imports/stock-import.module';
import { StockImportItemModule } from './modules/stock-imports/stock-import-item/stock-import-item.module';

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
      ],
      synchronize: false,
      logging: true,
    }),
    SupplierModule,
    StockImportModule,
    StockImportItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
