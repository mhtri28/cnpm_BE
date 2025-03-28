import { DataSource } from 'typeorm';
import AppDataSource from '../../../ormconfig';
import { permissionSeeder } from './permission.seeder';
import { roleSeeder } from './role.seeder';
import { userSeeder } from './user.seeder';

const runSeeders = async () => {
  try {
    // Kết nối database
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Chạy các seeders theo thứ tự
    await permissionSeeder(AppDataSource);
    await roleSeeder(AppDataSource);
    await userSeeder(AppDataSource);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeeders();
