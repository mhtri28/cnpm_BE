import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1712143000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Employees table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'barista', 'inventory_manager') NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL
      )
    `);

    // Suppliers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL
      )
    `);

    // Drinks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS drinks (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(8, 2) NOT NULL,
        soldCount BIGINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL
      )
    `);

    // Ingredients table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        supplierId BIGINT UNSIGNED NOT NULL,
        name VARCHAR(255) NOT NULL,
        availableCount BIGINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL,
        FOREIGN KEY (supplierId) REFERENCES suppliers(id)
      )
    `);

    // Recipes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        drinkId BIGINT UNSIGNED NOT NULL,
        ingredientId BIGINT UNSIGNED NOT NULL,
        quantity BIGINT NOT NULL,
        FOREIGN KEY (drinkId) REFERENCES drinks(id),
        FOREIGN KEY (ingredientId) REFERENCES ingredients(id)
      )
    `);

    // Orders table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        employeeId BIGINT UNSIGNED NOT NULL,
        status ENUM('pending', 'preparing', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employeeId) REFERENCES employees(id)
      )
    `);

    // Order items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        orderId BIGINT UNSIGNED NOT NULL,
        drinkId BIGINT UNSIGNED NOT NULL,
        priceAtOrder DECIMAL(8, 2) NOT NULL,
        quantity BIGINT NOT NULL,
        subTotal DECIMAL(8, 2) NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (drinkId) REFERENCES drinks(id)
      )
    `);

    // Payments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        orderId BIGINT UNSIGNED NOT NULL,
        transactionId BIGINT NOT NULL,
        totalAmount DECIMAL(8, 2) NOT NULL,
        method ENUM('cash', 'card', 'momo', 'zalo_pay', 'vnpay') NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);

    // Stock imports table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_imports (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        employeeId BIGINT UNSIGNED NOT NULL,
        supplierId BIGINT UNSIGNED NOT NULL,
        totalCost DECIMAL(8, 2) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL,
        FOREIGN KEY (employeeId) REFERENCES employees(id),
        FOREIGN KEY (supplierId) REFERENCES suppliers(id)
      )
    `);

    // Stock import items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_import_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        ingredientId BIGINT UNSIGNED NOT NULL,
        stockImportId BIGINT UNSIGNED NOT NULL,
        unitPrice DECIMAL(8, 2) NOT NULL,
        quantity BIGINT NOT NULL,
        subTotal DECIMAL(8, 2) NOT NULL,
        FOREIGN KEY (ingredientId) REFERENCES ingredients(id),
        FOREIGN KEY (stockImportId) REFERENCES stock_imports(id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS stock_import_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_imports`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS recipes`);
    await queryRunner.query(`DROP TABLE IF EXISTS ingredients`);
    await queryRunner.query(`DROP TABLE IF EXISTS drinks`);
    await queryRunner.query(`DROP TABLE IF EXISTS suppliers`);
    await queryRunner.query(`DROP TABLE IF EXISTS employees`);
  }
}
