import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/role.decorator';
import { EmployeeRole } from '../modules/employees/entities/employee.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy các role được yêu cầu từ decorator
    const requiredRoles = this.reflector.get<EmployeeRole[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    // Nếu không có role nào được yêu cầu, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No roles required, access granted');
      return true;
    }

    // Lấy đối tượng request từ context
    const request = context.switchToHttp().getRequest();
    const currentUser = request.currentUser;

    this.logger.debug(`Current user: ${JSON.stringify(currentUser)}`);

    // Nếu không có currentUser (chưa xác thực), từ chối truy cập
    if (!currentUser) {
      this.logger.error('No current user found');
      throw new ForbiddenException('User not authenticated');
    }

    // Kiểm tra xem user có role phù hợp không
    const hasRequiredRole = requiredRoles.includes(currentUser.role);

    this.logger.debug(`User role: ${currentUser.role}`);
    this.logger.debug(`Has required role: ${hasRequiredRole}`);

    if (!hasRequiredRole) {
      this.logger.error(
        `Access denied. User role: ${currentUser.role}, Required roles: ${requiredRoles.join(
          ', ',
        )}`,
      );
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(', ')}. Your role: ${
          currentUser.role
        }`,
      );
    }

    return true;
  }
}
