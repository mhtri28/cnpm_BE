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
      role_id: adminRole.id
    },
    {
      name: 'Waiter User',
      email: 'waiter@example.com',
      password: hashedPassword,
      phone: '0123456788',
      role_id: waiterRole.id
    },
    {
      name: 'Bartender User',
      email: 'bartender@example.com',
      password: hashedPassword,
      phone: '0123456787',
      role_id: bartenderRole.id
    },
    {
      name: 'Inventory User',
      email: 'inventory@example.com',
      password: hashedPassword,
      phone: '0123456786',
      role_id: inventoryRole.id
    }
  ];

  // Kiểm tra và thêm từng user
  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: [
        { email: userData.email },
        { phone: userData.phone }
      ]
    });

    if (!existingUser) {
      await userRepository.save(userData);
    }
  }
};
