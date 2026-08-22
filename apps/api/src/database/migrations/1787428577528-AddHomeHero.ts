import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHomeHero1787428577528 implements MigrationInterface {
  name = 'AddHomeHero1787428577528';

  // Trimmed by hand from the raw `migration:generate` output, same as every
  // other migration in this project — the generator also proposed dropping
  // and recreating nearly every foreign key in the database just to
  // reconcile cosmetic ON UPDATE RESTRICT vs NO ACTION drift. This
  // migration only creates the one new table and seeds its single row —
  // pointing at the current hardcoded Hero.tsx copy and image, so switching
  // the homepage over to reading from this table changes nothing visually
  // until an admin edits it.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`home_hero\` (\`id\` int NOT NULL, \`eyebrow\` varchar(100) NULL, \`heading\` varchar(200) NOT NULL, \`description\` text NULL, \`primaryCtaLabel\` varchar(60) NULL, \`primaryCtaHref\` varchar(255) NULL, \`secondaryCtaLabel\` varchar(60) NULL, \`secondaryCtaHref\` varchar(255) NULL, \`banner_image_asset_id\` int NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`home_hero\` ADD CONSTRAINT \`FK_c33dd94d0d0232abe6137c7b387\` FOREIGN KEY (\`banner_image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    const assetResult = (await queryRunner.query(
      'INSERT INTO `media_assets` (`url`, `provider`) VALUES (?, ?)',
      [
        'https://images.unsplash.com/photo-1646182504823-a02b768e28b5?auto=format&fit=crop&w=1200&q=80',
        'external',
      ],
    )) as { insertId: number };
    const bannerImageAssetId = assetResult.insertId;

    await queryRunner.query(
      'INSERT INTO `home_hero` (`id`, `eyebrow`, `heading`, `description`, `primaryCtaLabel`, `primaryCtaHref`, `secondaryCtaLabel`, `secondaryCtaHref`, `banner_image_asset_id`) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        'Unique Gifts',
        'for Every Occasion',
        'Delivering quality gifts, curated collections and personalised keepsakes — everything you need to make someone smile.',
        'Shop Now',
        '/shop',
        'Our Story',
        '/about',
        bannerImageAssetId,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`home_hero\` DROP FOREIGN KEY \`FK_c33dd94d0d0232abe6137c7b387\``,
    );
    await queryRunner.query(`DROP TABLE \`home_hero\``);
  }
}
