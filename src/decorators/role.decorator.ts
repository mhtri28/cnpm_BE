import { SetMetadata } from '@nestjs/common';
import { EmployeeRole } from 'src/modules/employees/entities/employee.entity';

export const ROLE_KEY = 'role';

export const Roles = (...role: EmployeeRole[]) => SetMetadata(ROLE_KEY, role);
