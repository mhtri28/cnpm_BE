import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/guard/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [EmployeesService, AuthService],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
