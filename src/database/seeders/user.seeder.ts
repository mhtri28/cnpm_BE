import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

export const userSeeder = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  // Tìm roles
  const adminRole = await roleRepository.findOneBy({ name: 'Admin' });
  const waiterRole = await roleRepository.findOneBy({ name: 'Waiter' });
  const bartenderRole = await roleRepository.findOneBy({ name: 'Bartender' });
  const inventoryRole = await roleRepository.findOneBy({ name: 'Inventory' });

  if (!adminRole || !waiterRole || !bartenderRole || !inventoryRole) {
    throw new Error('Required roles not found in database');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Tạo users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '0123056789',
      role: adminRole,
      roleId: adminRole.id
    },
    {
      name: 'Waiter User',
      email: 'waiter@example.com',
      password: hashedPassword,
      phone: '0123456788',
      role: waiterRole,
      roleId: waiterRole.id
    },
    {
      name: 'Bartender User',
      email: 'bartender@example.com',
      password: hashedPassword,
      phone: '0123456787',
      role: bartenderRole,
      roleId: bartenderRole.id
    },
    {
      name: 'Inventory User',
      email: 'inventory@example.com',
      password: hashedPassword,
      phone: '0123456786',
      role: inventoryRole,
      roleId: inventoryRole.id
    }
  ];

  // Kiểm tra và thêm/cập nhật từng user
  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: [
        { email: userData.email },
        { phone: userData.phone }
      ]
    });

    if (existingUser) {
      // Cập nhật thông tin user đã tồn tại
      await userRepository.update(existingUser.id, {
        name: userData.name,
        password: userData.password,
        role: userData.role,
        roleId: userData.roleId
      });
    } else {
      // Tạo user mới
      await userRepository.save(userData);
    }
  }
};
