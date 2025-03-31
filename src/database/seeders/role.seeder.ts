import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

export const roleSeeder = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  // Tìm permissions
  const permissions = await permissionRepository.find();

  // Tạo roles với permissions tương ứng
  const roles = [
    {
      name: 'Admin',
      description: 'Quản trị viên hệ thống',
      permissions: permissions
    },
    {
      name: 'Inventory',
      description: 'Nhân viên kho',
      permissions: await permissionRepository.find({
        where: [
          { name: 'view-inventory' },
          { name: 'create-inventory' },
          { name: 'approve-inventory' },
          { name: 'view-products' }
        ]
      })
    },
    {
      name: 'Waiter',
      description: 'Nhân viên phục vụ',
      permissions: await permissionRepository.find({
        where: [
          { name: 'view-orders' },
          { name: 'update-order-status' }
        ]
      })
    },
    {
      name: 'Bartender',
      description: 'Nhân viên pha chế',
      permissions: await permissionRepository.find({
        where: [
          { name: 'view-orders' },
          { name: 'update-order-status' },
          { name: 'view-products' }
        ]
      })
    }
  ];

  await roleRepository.save(roles);
};
