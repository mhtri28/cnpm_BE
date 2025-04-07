import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthService } from 'src/guard/auth.service';
import { LoginUserDto } from './dtos/LoginUserDto';
import { AuthGuard } from 'src/guard/auth.guard';
import { CreateUserDto } from './dtos/createUser.dto';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { RefreshTokenDto } from 'src/guard/dtos/refreshToken.dto';

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

  @Post('register')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN) // Chỉ ADMIN mới có thể tạo nhân viên mới
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() requestBody: LoginUserDto) {
    return this.authService.signIn(requestBody);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
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

  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateUserDto,
  ) {
    return this.employeeService.update(id, requestBody);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.delete(id);
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  restoreUser(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.restore(id);
  }
}
