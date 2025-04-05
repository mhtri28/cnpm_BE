import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierController } from './suppliers.controller';
import { SupplierService } from './suppliers.service';
import { GuardModule } from '../../guard/guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    GuardModule,
  ],
  providers: [SupplierService],
  controllers: [SupplierController],
  exports: [SupplierService],
})
export class SupplierModule {}
