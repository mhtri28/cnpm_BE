import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(EmployeeRole)
  role: EmployeeRole;
}
