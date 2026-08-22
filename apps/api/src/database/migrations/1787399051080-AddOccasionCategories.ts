import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOccasionCategories1787399051080 implements MigrationInterface {
  name = 'AddOccasionCategories1787399051080';

  // Trimmed by hand from the raw `migration:generate` output, same as
  // AddOccasions1787259201712 — the generator also proposed dropping and
  // recreating every existing FK just to reconcile cosmetic
  // ON UPDATE RESTRICT vs NO ACTION drift. This migration only creates
  // the two new tables this feature needs.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`occasion_categories_custom\` (\`id\` int NOT NULL AUTO_INCREMENT, \`occasion_id\` int NOT NULL, \`name\` varchar(160) NOT NULL, \`slug\` varchar(160) NOT NULL, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_942be5ee42ff441476c04fdbc5\` (\`occasion_id\`, \`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`occasion_category_products\` (\`occasion_category_id\` int NOT NULL, \`product_id\` int NOT NULL, INDEX \`IDX_03dc9f5efe25e15c254a9fbfb2\` (\`occasion_category_id\`), INDEX \`IDX_1b47c2e6f6371a5a6383e27896\` (\`product_id\`), PRIMARY KEY (\`occasion_category_id\`, \`product_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories_custom\` ADD CONSTRAINT \`FK_6d1f74c7a86ad22bd206e1e668b\` FOREIGN KEY (\`occasion_id\`) REFERENCES \`occasions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_category_products\` ADD CONSTRAINT \`FK_03dc9f5efe25e15c254a9fbfb2f\` FOREIGN KEY (\`occasion_category_id\`) REFERENCES \`occasion_categories_custom\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_category_products\` ADD CONSTRAINT \`FK_1b47c2e6f6371a5a6383e27896a\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`occasion_category_products\` DROP FOREIGN KEY \`FK_1b47c2e6f6371a5a6383e27896a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_category_products\` DROP FOREIGN KEY \`FK_03dc9f5efe25e15c254a9fbfb2f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories_custom\` DROP FOREIGN KEY \`FK_6d1f74c7a86ad22bd206e1e668b\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1b47c2e6f6371a5a6383e27896\` ON \`occasion_category_products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_03dc9f5efe25e15c254a9fbfb2\` ON \`occasion_category_products\``,
    );
    await queryRunner.query(`DROP TABLE \`occasion_category_products\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_942be5ee42ff441476c04fdbc5\` ON \`occasion_categories_custom\``,
    );
    await queryRunner.query(`DROP TABLE \`occasion_categories_custom\``);
  }
}
