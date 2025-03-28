import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'kiet',
  password: 'password',
  database: 'cnpm',
  entities: [User], // Thêm tất cả các entity vào đây
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource; // Export đúng DataSource instance
