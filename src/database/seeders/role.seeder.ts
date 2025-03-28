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
      name: 'Sales',
      description: 'Nhân viên bán hàng',
      permissions: await permissionRepository.find({
        where: [
          { name: 'view-products' },
          { name: 'view-orders' },
          { name: 'create-orders' },
          { name: 'edit-orders' },
          { name: 'delete-orders' }
        ]
      })
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
    }
  ];

  await roleRepository.save(roles);
};
