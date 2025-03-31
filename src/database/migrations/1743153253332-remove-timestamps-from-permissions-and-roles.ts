import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTimestampsFromPermissionsAndRoles1743153253332 implements MigrationInterface {
    name = 'RemoveTimestampsFromPermissionsAndRoles1743153253332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`updatedAt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}
