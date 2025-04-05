import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmployeesModule } from '../modules/employees/employees.module';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => EmployeesModule),
  ],
  providers: [AuthGuard, RoleGuard, AuthService],
  exports: [AuthGuard, RoleGuard, AuthService],
})
export class GuardModule {} 