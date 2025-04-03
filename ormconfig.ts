import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    'dist/**/*.entity{.js}',  // compiled JavaScript files for production
    'src/**/*.entity{.ts,.js}',  // TypeScript and JavaScript files for development
  ],
  migrations: [
    'dist/database/migrations/*.js', // For production (compiled migrations)
    'src/database/migrations/*.ts', // For development (TypeScript migrations)
  ],
  synchronize: false,
});

export default AppDataSource;
