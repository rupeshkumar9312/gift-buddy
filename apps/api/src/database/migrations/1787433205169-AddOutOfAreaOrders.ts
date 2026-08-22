import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutOfAreaOrders1787433205169 implements MigrationInterface {
  name = 'AddOutOfAreaOrders1787433205169';

  // Trimmed by hand from the raw `migration:generate` output, same as every
  // other migration in this project — the generator also proposed dropping
  // and recreating unrelated foreign keys to reconcile cosmetic ON UPDATE
  // RESTRICT vs NO ACTION drift. This migration only creates the one new
  // `out_of_area_orders` table.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`out_of_area_orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`address\` json NOT NULL, \`items\` json NOT NULL, \`subtotal\` decimal(10,2) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`out_of_area_orders\``);
  }
}
