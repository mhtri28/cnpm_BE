import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/users/entities/user.entity';
import { Permission } from './src/permissions/entities/permission.entity';
import { Role } from './src/roles/entities/role.entity';

config(); // Load environment variables from .env file

const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Permission, Role, User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;