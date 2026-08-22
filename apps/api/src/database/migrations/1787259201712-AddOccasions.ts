import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOccasions1787259201712 implements MigrationInterface {
  name = 'AddOccasions1787259201712';

  // Trimmed by hand from the raw `migration:generate` output — the
  // generator also proposed dropping/recreating every existing FK in the
  // database just to reconcile a cosmetic ON UPDATE RESTRICT vs NO ACTION
  // drift between the live schema and TypeORM's metadata. This migration
  // only creates the three new tables Occasions needs.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`occasions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(160) NOT NULL, \`name\` varchar(160) NOT NULL, \`tagline\` varchar(200) NULL, \`description\` text NULL, \`banner_image_asset_id\` int NULL, \`startsAt\` datetime NULL, \`endsAt\` datetime NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9a11ad48cb8c8895edd5c26ef1\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`occasion_categories\` (\`occasion_id\` int NOT NULL, \`category_id\` int NOT NULL, INDEX \`IDX_9ee22ee9e26c88cb18604f515a\` (\`occasion_id\`), INDEX \`IDX_d9bbb7c60e885d9a11f2225b74\` (\`category_id\`), PRIMARY KEY (\`occasion_id\`, \`category_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`occasion_products\` (\`occasion_id\` int NOT NULL, \`product_id\` int NOT NULL, INDEX \`IDX_1584ebf2496510adb08dc51dfc\` (\`occasion_id\`), INDEX \`IDX_3d6c8d6b16fc1387fec336fdac\` (\`product_id\`), PRIMARY KEY (\`occasion_id\`, \`product_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasions\` ADD CONSTRAINT \`FK_b3380927bb4fb8bc9fdfb05a293\` FOREIGN KEY (\`banner_image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories\` ADD CONSTRAINT \`FK_9ee22ee9e26c88cb18604f515aa\` FOREIGN KEY (\`occasion_id\`) REFERENCES \`occasions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories\` ADD CONSTRAINT \`FK_d9bbb7c60e885d9a11f2225b740\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_products\` ADD CONSTRAINT \`FK_1584ebf2496510adb08dc51dfc2\` FOREIGN KEY (\`occasion_id\`) REFERENCES \`occasions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_products\` ADD CONSTRAINT \`FK_3d6c8d6b16fc1387fec336fdac5\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`occasion_products\` DROP FOREIGN KEY \`FK_3d6c8d6b16fc1387fec336fdac5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_products\` DROP FOREIGN KEY \`FK_1584ebf2496510adb08dc51dfc2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories\` DROP FOREIGN KEY \`FK_d9bbb7c60e885d9a11f2225b740\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasion_categories\` DROP FOREIGN KEY \`FK_9ee22ee9e26c88cb18604f515aa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`occasions\` DROP FOREIGN KEY \`FK_b3380927bb4fb8bc9fdfb05a293\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3d6c8d6b16fc1387fec336fdac\` ON \`occasion_products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1584ebf2496510adb08dc51dfc\` ON \`occasion_products\``,
    );
    await queryRunner.query(`DROP TABLE \`occasion_products\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d9bbb7c60e885d9a11f2225b74\` ON \`occasion_categories\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9ee22ee9e26c88cb18604f515a\` ON \`occasion_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`occasion_categories\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_9a11ad48cb8c8895edd5c26ef1\` ON \`occasions\``,
    );
    await queryRunner.query(`DROP TABLE \`occasions\``);
  }
}
