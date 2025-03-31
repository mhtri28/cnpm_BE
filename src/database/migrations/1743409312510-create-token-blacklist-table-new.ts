import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class CreateTokenBlacklistTableNew1743409312510 implements MigrationInterface {
    name = 'CreateTokenBlacklistTableNew1743409312510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1aeeb86b9610f47f8a28e2be1db\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5054d562cf9a0e391dde74eb1ed\``);
        await queryRunner.query(`DROP INDEX \`FK_145532db85752b29c57d2b7b1f1\` ON \`order_items\``);
        await queryRunner.query(`DROP INDEX \`FK_1aeeb86b9610f47f8a28e2be1db\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`FK_5054d562cf9a0e391dde74eb1ed\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`suppliers\` ADD UNIQUE INDEX \`IDX_ef7f8f1699296ab0bfabc5fd48\` (\`phone\`)`);
        await queryRunner.query(`ALTER TABLE \`suppliers\` ADD UNIQUE INDEX \`IDX_66181e465a65c2ddcfa9c00c9c\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`order_id\` \`order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`waiter_id\` \`waiter_id\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1aeeb86b9610f47f8a28e2be1db\` FOREIGN KEY (\`waiter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_5054d562cf9a0e391dde74eb1ed\` FOREIGN KEY (\`bartender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.createTable(
            new Table({
                name: 'token_blacklist',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'token',
                        type: 'varchar',
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamp',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('token_blacklist');
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5054d562cf9a0e391dde74eb1ed\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1aeeb86b9610f47f8a28e2be1db\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`waiter_id\` \`waiter_id\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`order_id\` \`order_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`suppliers\` DROP INDEX \`IDX_66181e465a65c2ddcfa9c00c9c\``);
        await queryRunner.query(`ALTER TABLE \`suppliers\` DROP INDEX \`IDX_ef7f8f1699296ab0bfabc5fd48\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`CREATE INDEX \`FK_5054d562cf9a0e391dde74eb1ed\` ON \`orders\` (\`bartender_id\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_1aeeb86b9610f47f8a28e2be1db\` ON \`orders\` (\`waiter_id\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_145532db85752b29c57d2b7b1f1\` ON \`order_items\` (\`order_id\`)`);
    }

}
