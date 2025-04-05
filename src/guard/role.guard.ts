import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from 'src/decorators/role.decorator';
import { EmployeeRole } from 'src/modules/employees/entities/employee.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy các role được yêu cầu từ decorator
    const requiredRoles = this.reflector.get<EmployeeRole[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    // Nếu không có role nào được yêu cầu, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy đối tượng request từ context
    const { currentUser } = context.switchToHttp().getRequest();

    // Nếu không có currentUser (chưa xác thực), từ chối truy cập
    if (!currentUser) {
      throw new ForbiddenException('User not authenticated');
    }

    // Kiểm tra xem user có role phù hợp không
    const hasRequiredRole = requiredRoles.includes(
      currentUser.role as EmployeeRole,
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
