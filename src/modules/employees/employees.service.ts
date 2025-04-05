import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';

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
