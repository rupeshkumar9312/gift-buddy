import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReturnRequests1787514145234 implements MigrationInterface {
  name = 'AddReturnRequests1787514145234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Snapshotted from product.returnDays at checkout, same reasoning as
    // orders.deliveryExtraDays — a later change to the product never
    // retroactively changes an already-placed order's return eligibility.
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`returnDays\` int NULL`,
    );

    await queryRunner.query(
      `CREATE TABLE \`return_requests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`order_item_id\` int NOT NULL, \`quantity\` int NOT NULL, \`reason\` text NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'requested', \`adminNote\` text NULL, \`resolvedAt\` datetime NULL, \`resolved_by_admin_id\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_return_requests_order_id\` (\`order_id\`), INDEX \`IDX_return_requests_order_item_id\` (\`order_item_id\`), INDEX \`IDX_return_requests_resolved_by_admin_id\` (\`resolved_by_admin_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` ADD CONSTRAINT \`FK_return_requests_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` ADD CONSTRAINT \`FK_return_requests_order_item\` FOREIGN KEY (\`order_item_id\`) REFERENCES \`order_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` ADD CONSTRAINT \`FK_return_requests_resolved_by_admin\` FOREIGN KEY (\`resolved_by_admin_id\`) REFERENCES \`admin_users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` DROP FOREIGN KEY \`FK_return_requests_resolved_by_admin\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` DROP FOREIGN KEY \`FK_return_requests_order_item\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`return_requests\` DROP FOREIGN KEY \`FK_return_requests_order\``,
    );
    await queryRunner.query(`DROP TABLE \`return_requests\``);
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP COLUMN \`returnDays\``,
    );
  }
}
