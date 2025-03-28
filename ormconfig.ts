import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Permission } from './src/permissions/entities/permission.entity';
import { Role } from './src/roles/entities/role.entity';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'kiet',
  password: 'password',
  database: 'cnpm',
  entities: [Permission, Role, User], // Thêm tất cả các entity vào đây
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource; // Export đúng DataSource instance
