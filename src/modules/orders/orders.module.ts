import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DrinksModule } from '../drinks/drinks.module';
import { TablesModule } from '../tables/tables.module';
import { EmployeesModule } from '../employees/employees.module';
import { GuardModule } from '../../guard/guard.module';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Recipe, Ingredient]),
    DrinksModule,
    forwardRef(() => TablesModule),
    EmployeesModule,
    GuardModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
