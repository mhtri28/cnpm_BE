import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table, TableForeignKey } from "typeorm";

export class CreateSuppliersTable1743153253333 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "suppliers",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        unsigned: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "50",
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "10",
                        isUnique: true,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "address",
                        type: "varchar",
                        length: "50",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("suppliers");
    }
}
