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
import { AuthService } from 'src/guard/auth.service';
import { LoginUserDto } from './dtos/LoginUserDto';
import { AuthGuard } from 'src/guard/auth.guard';
import { CreateUserDto } from './dtos/createUser.dto';

@Controller('employees')
@UseInterceptors(ClassSerializerInterceptor)
export class EmployeesController {
  constructor(
    private employeeService: EmployeesService,
    private authService: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getAllUser() {
    return this.employeeService.findAll();
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
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
