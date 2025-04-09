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
import { AuthService } from '../../guard/auth.service';
import { LoginUserDto } from './dtos/LoginUserDto';
import { AuthGuard } from '../../guard/auth.guard';
import { CreateUserDto } from './dtos/createUser.dto';
import { CurrentUser } from '../../decorators/currentUser.decorator';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { RefreshTokenDto } from 'src/guard/dtos/refreshToken.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
@UseInterceptors(ClassSerializerInterceptor)
export class EmployeesController {
  constructor(
    private employeeService: EmployeesService,
    private authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Lấy tất cả nhân viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách tất cả nhân viên',
  })
  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  getAllUser() {
    return this.employeeService.findAll();
  }

  @ApiOperation({ summary: 'Đăng ký nhân viên mới' })
  @ApiResponse({ status: 201, description: 'Nhân viên đã được tạo thành công' })
  @ApiBearerAuth()
  @Post('register')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN) // Chỉ ADMIN mới có thể tạo nhân viên mới
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về token',
  })
  @ApiResponse({ status: 401, description: 'Đăng nhập thất bại' })
  @Post('login')
  login(@Body() requestBody: LoginUserDto) {
    return this.authService.signIn(requestBody);
  }

  @ApiOperation({ summary: 'Làm mới token' })
  @ApiResponse({ status: 200, description: 'Token đã được làm mới thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin nhân viên hiện tại',
  })
  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(AuthGuard)
  getUser(@CurrentUser() currentUser: Employee) {
    return currentUser;
  }

  @ApiOperation({ summary: 'Lấy thông tin nhân viên theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin nhân viên' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findById(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin nhân viên' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin nhân viên đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateUserDto,
  ) {
    return this.employeeService.update(id, requestBody);
  }

  @ApiOperation({ summary: 'Xóa nhân viên' })
  @ApiResponse({ status: 200, description: 'Nhân viên đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.delete(id);
  }

  @ApiOperation({ summary: 'Khôi phục nhân viên đã xóa' })
  @ApiResponse({ status: 200, description: 'Nhân viên đã được khôi phục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhân viên' })
  @ApiBearerAuth()
  @Patch(':id/restore')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  restoreUser(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.restore(id);
  }
}
