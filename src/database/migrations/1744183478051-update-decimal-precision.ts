import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDecimalPrecision1744183478051 implements MigrationInterface {
  name = 'UpdateDecimalPrecision1744183478051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`order_items_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`order_items_ibfk_2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`recipes_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`recipes_ibfk_2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP FOREIGN KEY \`ingredients_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` DROP FOREIGN KEY \`stock_import_items_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` DROP FOREIGN KEY \`stock_import_items_ibfk_2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP FOREIGN KEY \`stock_imports_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP FOREIGN KEY \`stock_imports_ibfk_2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`payments_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`orders_ibfk_1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`orders_ibfk_2\``,
    );
    await queryRunner.query(`DROP INDEX \`drinkId\` ON \`order_items\``);
    await queryRunner.query(`DROP INDEX \`orderId\` ON \`order_items\``);
    await queryRunner.query(`DROP INDEX \`drinkId\` ON \`recipes\``);
    await queryRunner.query(`DROP INDEX \`ingredientId\` ON \`recipes\``);
    await queryRunner.query(`DROP INDEX \`supplierId\` ON \`ingredients\``);
    await queryRunner.query(
      `DROP INDEX \`ingredientId\` ON \`stock_import_items\``,
    );
    await queryRunner.query(
      `DROP INDEX \`stockImportId\` ON \`stock_import_items\``,
    );
    await queryRunner.query(`DROP INDEX \`employeeId\` ON \`stock_imports\``);
    await queryRunner.query(`DROP INDEX \`supplierId\` ON \`stock_imports\``);
    await queryRunner.query(`DROP INDEX \`orderId\` ON \`payments\``);
    await queryRunner.query(`DROP INDEX \`employeeId\` ON \`orders\``);
    await queryRunner.query(`DROP INDEX \`tableId\` ON \`orders\``);
    await queryRunner.query(`ALTER TABLE \`suppliers\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`name\` varchar(50) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`suppliers\` DROP COLUMN \`phone\``);
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`phone\` varchar(10) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD UNIQUE INDEX \`IDX_ef7f8f1699296ab0bfabc5fd48\` (\`phone\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD UNIQUE INDEX \`IDX_66181e465a65c2ddcfa9c00c9c\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`address\` varchar(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD UNIQUE INDEX \`IDX_b197b779114d6bc7abd36a8109\` (\`name\`)`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`deletedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` CHANGE \`availableCount\` \`availableCount\` bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` CHANGE \`subTotal\` \`subTotal\` decimal(13,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` CHANGE \`totalCost\` \`totalCost\` decimal(15,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`name\` varchar(50) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`phone\``);
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`phone\` varchar(10) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD UNIQUE INDEX \`IDX_cbc362d1c574464a63d3acc3ea\` (\`phone\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD UNIQUE INDEX \`IDX_765bc1ac8967533a04c74a9f6a\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` CHANGE \`role\` \`role\` enum ('admin', 'barista', 'inventory_manager') NOT NULL DEFAULT 'barista'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD UNIQUE INDEX \`IDX_af929a5f2a400fdb6913b4967e\` (\`orderId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`id\` varchar(255) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`updatedAt\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`deletedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`deletedAt\` datetime(6) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_af929a5f2a400fdb6913b4967e\` ON \`payments\` (\`orderId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_75d1b6b7c9e83cccaa9b6d4b09a\` FOREIGN KEY (\`drinkId\`) REFERENCES \`drinks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_936d48546f76d9d8536b1c60398\` FOREIGN KEY (\`drinkId\`) REFERENCES \`drinks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`FK_9ec0120c33a1c546fe5ae7e004b\` FOREIGN KEY (\`ingredientId\`) REFERENCES \`ingredients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD CONSTRAINT \`FK_c647395028351795765fefe6a3d\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` ADD CONSTRAINT \`FK_5f6292a09808c61da4d16ba1533\` FOREIGN KEY (\`ingredientId\`) REFERENCES \`ingredients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` ADD CONSTRAINT \`FK_de99327a756aba6f682570d2d6c\` FOREIGN KEY (\`stockImportId\`) REFERENCES \`stock_imports\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD CONSTRAINT \`FK_a1e9ad7ec2a9c9ce2e96315944b\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD CONSTRAINT \`FK_e75db7cfe83b1bfaecd95142fed\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_af929a5f2a400fdb6913b4967e1\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_59fadea46c0451b6663017f4c51\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2a7fdd7af437285a3ef0fc8b64f\` FOREIGN KEY (\`tableId\`) REFERENCES \`tables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2a7fdd7af437285a3ef0fc8b64f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_59fadea46c0451b6663017f4c51\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_af929a5f2a400fdb6913b4967e1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP FOREIGN KEY \`FK_e75db7cfe83b1bfaecd95142fed\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP FOREIGN KEY \`FK_a1e9ad7ec2a9c9ce2e96315944b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` DROP FOREIGN KEY \`FK_de99327a756aba6f682570d2d6c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` DROP FOREIGN KEY \`FK_5f6292a09808c61da4d16ba1533\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP FOREIGN KEY \`FK_c647395028351795765fefe6a3d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_9ec0120c33a1c546fe5ae7e004b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` DROP FOREIGN KEY \`FK_936d48546f76d9d8536b1c60398\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_75d1b6b7c9e83cccaa9b6d4b09a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_af929a5f2a400fdb6913b4967e\` ON \`payments\``,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`deletedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`tables\` ADD \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`tables\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP INDEX \`IDX_af929a5f2a400fdb6913b4967e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` CHANGE \`role\` \`role\` enum ('admin', 'barista', 'inventory_manager') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP INDEX \`IDX_765bc1ac8967533a04c74a9f6a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`employees\` DROP INDEX \`IDX_cbc362d1c574464a63d3acc3ea\``,
    );
    await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`phone\``);
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`phone\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`employees\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`employees\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` CHANGE \`totalCost\` \`totalCost\` decimal(15,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` CHANGE \`subTotal\` \`subTotal\` decimal(13,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` CHANGE \`availableCount\` \`availableCount\` bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`deletedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`drinks\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`drinks\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`drinks\` DROP INDEX \`IDX_b197b779114d6bc7abd36a8109\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`deletedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`deletedAt\` timestamp(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`updatedAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`updatedAt\` timestamp(0) NULL ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`createdAt\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP COLUMN \`address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`address\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP INDEX \`IDX_66181e465a65c2ddcfa9c00c9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` DROP INDEX \`IDX_ef7f8f1699296ab0bfabc5fd48\``,
    );
    await queryRunner.query(`ALTER TABLE \`suppliers\` DROP COLUMN \`phone\``);
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`phone\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`suppliers\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`suppliers\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`tableId\` ON \`orders\` (\`tableId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`employeeId\` ON \`orders\` (\`employeeId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`orderId\` ON \`payments\` (\`orderId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`supplierId\` ON \`stock_imports\` (\`supplierId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`employeeId\` ON \`stock_imports\` (\`employeeId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`stockImportId\` ON \`stock_import_items\` (\`stockImportId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`ingredientId\` ON \`stock_import_items\` (\`ingredientId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`supplierId\` ON \`ingredients\` (\`supplierId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`ingredientId\` ON \`recipes\` (\`ingredientId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`drinkId\` ON \`recipes\` (\`drinkId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`orderId\` ON \`order_items\` (\`orderId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`drinkId\` ON \`order_items\` (\`drinkId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`orders_ibfk_2\` FOREIGN KEY (\`tableId\`) REFERENCES \`tables\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`orders_ibfk_1\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`payments_ibfk_1\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD CONSTRAINT \`stock_imports_ibfk_2\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_imports\` ADD CONSTRAINT \`stock_imports_ibfk_1\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` ADD CONSTRAINT \`stock_import_items_ibfk_2\` FOREIGN KEY (\`stockImportId\`) REFERENCES \`stock_imports\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`stock_import_items\` ADD CONSTRAINT \`stock_import_items_ibfk_1\` FOREIGN KEY (\`ingredientId\`) REFERENCES \`ingredients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`ingredients\` ADD CONSTRAINT \`ingredients_ibfk_1\` FOREIGN KEY (\`supplierId\`) REFERENCES \`suppliers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`recipes_ibfk_2\` FOREIGN KEY (\`ingredientId\`) REFERENCES \`ingredients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipes\` ADD CONSTRAINT \`recipes_ibfk_1\` FOREIGN KEY (\`drinkId\`) REFERENCES \`drinks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`order_items_ibfk_2\` FOREIGN KEY (\`drinkId\`) REFERENCES \`drinks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`order_items_ibfk_1\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
