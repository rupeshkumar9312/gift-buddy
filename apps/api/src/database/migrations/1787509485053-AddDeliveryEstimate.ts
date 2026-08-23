import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryEstimate1787509485053 implements MigrationInterface {
  name = 'AddDeliveryEstimate1787509485053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Null = same-day delivery, using the existing 5PM-IST-cutoff logic
    // unchanged. A positive number overrides that with a flat "N days from
    // order date" estimate instead. Null is the default, so every existing
    // product keeps behaving exactly as it does today.
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`deliveryEstimateDays\` int NULL`,
    );
    // Snapshotted onto the order at checkout (max across its line items'
    // products) so a later change to a product's delivery setting never
    // retroactively changes what an already-placed order's confirmation
    // page shows — same reasoning as the productName/unitPrice snapshots
    // already taken on order_items.
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`deliveryExtraDays\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`deliveryExtraDays\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP COLUMN \`deliveryEstimateDays\``,
    );
  }
}
