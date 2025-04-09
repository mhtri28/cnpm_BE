import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { GuardModule } from '../../guard/guard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Table]), GuardModule],
  providers: [TablesService],
  controllers: [TablesController],
  exports: [TablesService],
})
export class TablesModule {}
