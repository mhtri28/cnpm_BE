import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { JwtModule } from '@nestjs/jwt';
import { GuardModule } from '../../guard/guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => GuardModule),
  ],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
