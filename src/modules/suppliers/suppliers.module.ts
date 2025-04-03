import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierService } from './suppliers.service';
import { SupplierController } from './suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])], // ✅ Thêm vào module
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}