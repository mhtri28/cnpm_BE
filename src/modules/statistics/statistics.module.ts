// src/statistics/statistics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Order } from '../orders/entities/order.entity';
import { Drink } from '../drinks/entities/drink.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { GuardModule } from '../../guard/guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Drink, OrderItem, Payment]),
    GuardModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
