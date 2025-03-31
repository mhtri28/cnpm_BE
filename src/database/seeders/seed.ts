import { DataSource } from 'typeorm';
import { permissionSeeder } from './permission.seeder';
import { roleSeeder } from './role.seeder';
import { userSeeder } from './user.seeder';
import { supplierSeeder } from './supplier.seeder';
import { orderSeeder } from './order.seeder';
import AppDataSource from '../../../ormconfig';

const runSeeders = async () => {
  try {
    // Kết nối database
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Chạy các seeders theo thứ tự
    console.log('Running permission seeder...');
    await permissionSeeder(AppDataSource);

    console.log('Running role seeder...');
    await roleSeeder(AppDataSource);

    console.log('Running user seeder...');
    await userSeeder(AppDataSource);

    console.log('Running supplier seeder...');
    await supplierSeeder(AppDataSource);

    console.log('Running order seeder...');
    await orderSeeder(AppDataSource);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeeders();
