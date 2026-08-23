import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductReturnDays1787507106602 implements MigrationInterface {
  name = 'AddProductReturnDays1787507106602';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Default 30 (and nullable) so every existing product keeps showing the
    // same "30-day easy returns" it always has — admins opt individual
    // products out (or pick a different window) after this runs, nothing
    // changes on its own.
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`returnDays\` int NULL DEFAULT 30`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP COLUMN \`returnDays\``,
    );
  }
}
