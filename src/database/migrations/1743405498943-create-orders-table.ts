import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableForeignKey } from 'typeorm';

export class CreateOrdersTable1743405498943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'table_number',
            type: 'varchar',
          },
          {
            name: 'waiter_id',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'bartender_id',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'order_id',
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    // Tạo foreign keys
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['waiter_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['bartender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ordersTable = await queryRunner.getTable('orders');
    const orderItemsTable = await queryRunner.getTable('order_items');

    if (ordersTable) {
      const waiterForeignKey = ordersTable.foreignKeys.find(fk => fk.columnNames.indexOf('waiter_id') !== -1);
      const bartenderForeignKey = ordersTable.foreignKeys.find(fk => fk.columnNames.indexOf('bartender_id') !== -1);

      if (waiterForeignKey) {
        await queryRunner.dropForeignKey('orders', waiterForeignKey);
      }
      if (bartenderForeignKey) {
        await queryRunner.dropForeignKey('orders', bartenderForeignKey);
      }
    }

    if (orderItemsTable) {
      const orderForeignKey = orderItemsTable.foreignKeys.find(fk => fk.columnNames.indexOf('order_id') !== -1);
      if (orderForeignKey) {
        await queryRunner.dropForeignKey('order_items', orderForeignKey);
      }
    }

    await queryRunner.dropTable('order_items');
    await queryRunner.dropTable('orders');
  }
}
