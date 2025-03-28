import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

export const userSeeder = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  // Tìm roles
  const adminRole = await roleRepository.findOneBy({ name: 'Admin' });
  const salesRole = await roleRepository.findOneBy({ name: 'Sales' });
  const inventoryRole = await roleRepository.findOneBy({ name: 'Inventory' });

  if (!adminRole || !salesRole || !inventoryRole) {
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
      phone: '0123456789',
      role_id: adminRole.id
    },
    {
      name: 'Sales User',
      email: 'sales@example.com',
      password: hashedPassword,
      phone: '0123456788',
      role_id: salesRole.id
    },
    {
      name: 'Inventory User',
      email: 'inventory@example.com',
      password: hashedPassword,
      phone: '0123456787',
      role_id: inventoryRole.id
    }
  ];

  // Insert users
  await userRepository.save(users);
};
