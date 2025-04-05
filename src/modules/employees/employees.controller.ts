import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthService } from '../../guard/auth.service';
import { LoginUserDto } from './dtos/LoginUserDto';
import { AuthGuard } from '../../guard/auth.guard';
import { CreateUserDto } from './dtos/createUser.dto';
import { CurrentUser } from '../../decorators/currentUser.decorator';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { RoleGuard } from '../../guard/role.guard';
import { Roles } from '../../decorators/role.decorator';

@Controller('employees')
@UseInterceptors(ClassSerializerInterceptor)
export class EmployeesController {
  constructor(
    private employeeService: EmployeesService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  getAllUser() {
    return this.employeeService.findAll();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getUser(@CurrentUser() currentUser: Employee) {
    return currentUser;
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findById(id);
  }

  @Post('login')
  login(@Body() requestBody: LoginUserDto) {
    return this.authService.signIn(requestBody);
  }

  @Post('register')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN) // Chỉ ADMIN mới có thể tạo nhân viên mới
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
