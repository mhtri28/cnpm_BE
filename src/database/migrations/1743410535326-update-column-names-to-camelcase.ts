import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class UpdateColumnNamesToCamelcase1743410535326 implements MigrationInterface {
    name = 'UpdateColumnNamesToCamelcase1743410535326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1aeeb86b9610f47f8a28e2be1db\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5054d562cf9a0e391dde74eb1ed\``);
        await queryRunner.query(`DROP INDEX \`UQ_66181e465a65c2ddcfa9c00c9c7\` ON \`suppliers\``);
        await queryRunner.query(`DROP INDEX \`UQ_ef7f8f1699296ab0bfabc5fd48a\` ON \`suppliers\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`order_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`bartender_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`table_number\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total_amount\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`waiter_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`roleId\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`orderId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`tableNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`totalAmount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`waiterId\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`bartenderId\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`note\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`note\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2912d5ae4c5a140b02c1f0c7611\` FOREIGN KEY (\`waiterId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_3736be43dd97f321f3eecb31b0b\` FOREIGN KEY (\`bartenderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_3736be43dd97f321f3eecb31b0b\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2912d5ae4c5a140b02c1f0c7611\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`note\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`bartenderId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`waiterId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`totalAmount\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`tableNumber\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`orderId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`roleId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`waiter_id\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total_amount\` decimal NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`table_number\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`bartender_id\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role_id\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_ef7f8f1699296ab0bfabc5fd48a\` ON \`suppliers\` (\`phone\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_66181e465a65c2ddcfa9c00c9c7\` ON \`suppliers\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_5054d562cf9a0e391dde74eb1ed\` FOREIGN KEY (\`bartender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1aeeb86b9610f47f8a28e2be1db\` FOREIGN KEY (\`waiter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
