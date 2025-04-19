import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { GuardModule } from '../../guard/guard.module';
import { Order } from '../orders/entities/order.entity';
import { TableOrdersController } from './table-orders.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table, Order]),
    GuardModule,
    forwardRef(() => OrdersModule),
  ],
  providers: [TablesService],
  controllers: [TablesController, TableOrdersController],
  exports: [TablesService],
})
export class TablesModule {}
