import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee, EmployeeRole } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import * as bcrypt from 'bcrypt'; // thêm dòng này ở đầu file
@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
  ) {}

  // CRUD
  create(requestBody: CreateUserDto) {
    const user = this.employeeRepo.create(requestBody);
    return this.employeeRepo.save(user);
  }

  async update(id: number, requestBody: UpdateUserDto) {
    const user = await this.findById(id); // kiểm tra tồn tại

    user.email = requestBody.email ?? user.email;
    user.name = requestBody.name ?? user.name;
    user.phone = requestBody.phone ?? user.phone;
    user.role = requestBody.role ?? user.role;

    // Không cho phép cập nhật role thành admin
    if (requestBody.role === EmployeeRole.ADMIN) {
      throw new ForbiddenException('Không được thay đổi role thành ADMIN');
    }

    // Nếu có mật khẩu mới thì hash lại
    if (requestBody.password) {
      const salt = await bcrypt.genSalt();
      requestBody.password = await bcrypt.hash(requestBody.password, salt);
    } else {
      delete requestBody.password; // Không cập nhật password nếu không có
    }

    if (!requestBody.role) {
      delete requestBody.role;
    }

    Object.assign(user, requestBody);
    console.log(user);
    return this.employeeRepo.save(user);
  }

  async delete(id: number) {
    const user = await this.findById(id); // kiểm tra user có tồn tại không

    await this.employeeRepo.softDelete(id); // Soft delete

    const deletedUser = await this.employeeRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    return {
      message: `User with id ${id} has been deleted`,
      deletedUser: deletedUser,
    };
  }

  async restore(id: number) {
    const user = await this.employeeRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (!user.deletedAt) {
      return {
        message: `User with id ${id} is not deleted`,
      };
    }

    // Khôi phục user
    await this.employeeRepo.restore(id);

    return {
      message: `User with id ${id} has been restored`,
      restoredUser: user,
    };
  }

  findAll() {
    return this.employeeRepo.find();
  }

  async findById(id: number) {
    const user = await this.employeeRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  findByEmail(email: string) {
    return this.employeeRepo.findOneBy({ email });
  }
}
