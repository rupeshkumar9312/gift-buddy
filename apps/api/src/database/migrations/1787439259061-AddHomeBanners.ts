import { MigrationInterface, QueryRunner } from 'typeorm';

type InsertResult = { insertId: number };

export class AddHomeBanners1787439259061 implements MigrationInterface {
  name = 'AddHomeBanners1787439259061';

  // Trimmed by hand from the raw `migration:generate` output, same as every
  // other migration in this project — the generator also proposed dropping
  // and recreating unrelated foreign keys to reconcile cosmetic ON UPDATE
  // RESTRICT vs NO ACTION drift. This migration only creates the three new
  // tables and seeds rows matching the current hardcoded PromoBanners,
  // SaleBanners, and GiftKits components, so switching the homepage over to
  // reading from these tables changes nothing visually until an admin edits.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`promo_banners\` (\`id\` int NOT NULL AUTO_INCREMENT, \`eyebrow\` varchar(100) NULL, \`heading\` varchar(200) NOT NULL, \`subtitle\` varchar(200) NULL, \`ctaLabel\` varchar(60) NOT NULL, \`ctaHref\` varchar(255) NOT NULL, \`banner_image_asset_id\` int NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sortOrder\` int NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`promo_banners\` ADD CONSTRAINT \`FK_promo_banners_asset\` FOREIGN KEY (\`banner_image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE \`sale_banners\` (\`id\` int NOT NULL AUTO_INCREMENT, \`badge\` varchar(100) NULL, \`heading\` varchar(200) NOT NULL, \`subtitle\` varchar(200) NULL, \`note\` varchar(100) NULL, \`ctaLabel\` varchar(60) NOT NULL, \`ctaHref\` varchar(255) NOT NULL, \`banner_image_asset_id\` int NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sortOrder\` int NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sale_banners\` ADD CONSTRAINT \`FK_sale_banners_asset\` FOREIGN KEY (\`banner_image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE \`gift_kits\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(200) NOT NULL, \`subtitle\` varchar(100) NULL, \`href\` varchar(255) NOT NULL, \`banner_image_asset_id\` int NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sortOrder\` int NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`gift_kits\` ADD CONSTRAINT \`FK_gift_kits_asset\` FOREIGN KEY (\`banner_image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    const insertAsset = async (url: string): Promise<number> => {
      const result = (await queryRunner.query(
        'INSERT INTO `media_assets` (`url`, `provider`) VALUES (?, ?)',
        [url, 'external'],
      )) as InsertResult;
      return result.insertId;
    };

    const promoLoveAssetId = await insertAsset(
      'https://picsum.photos/seed/promo-love/900/700',
    );
    const promoStationeryAssetId = await insertAsset(
      'https://picsum.photos/seed/promo-stationery/900/700',
    );
    await queryRunner.query(
      'INSERT INTO `promo_banners` (`eyebrow`, `heading`, `subtitle`, `ctaLabel`, `ctaHref`, `banner_image_asset_id`, `sortOrder`) VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)',
      [
        'New Arrivals',
        'Send Your Love',
        'from ₹29.90',
        'Send Gift',
        '/shop',
        promoLoveAssetId,
        0,
        'Stationery',
        'Office & Stationery',
        'from ₹2.90',
        'Shop Now',
        '/shop?category=office-stationery',
        promoStationeryAssetId,
        1,
      ],
    );

    const womensDayAssetId = await insertAsset(
      'https://picsum.photos/seed/womens-day/900/600',
    );
    const holidayOffersAssetId = await insertAsset(
      'https://picsum.photos/seed/holiday-offers/900/600',
    );
    await queryRunner.query(
      'INSERT INTO `sale_banners` (`badge`, `heading`, `subtitle`, `note`, `ctaLabel`, `ctaHref`, `banner_image_asset_id`, `sortOrder`) VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        'Sale 50% Off',
        "Women's Day",
        null,
        null,
        'Shop Now',
        '/shop',
        womensDayAssetId,
        0,
        null,
        'Holiday Offers',
        'Sale 50% Off',
        'Code: GRS18',
        'Shop Now',
        '/shop',
        holidayOffersAssetId,
        1,
      ],
    );

    const kitHimAssetId = await insertAsset(
      'https://picsum.photos/seed/kit-him/500/400',
    );
    const kitBabyAssetId = await insertAsset(
      'https://picsum.photos/seed/kit-baby/500/400',
    );
    const kitHerAssetId = await insertAsset(
      'https://picsum.photos/seed/kit-her/500/400',
    );
    await queryRunner.query(
      'INSERT INTO `gift_kits` (`title`, `subtitle`, `href`, `banner_image_asset_id`, `sortOrder`) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [
        'For Him',
        '6 items',
        '/shop?kit=for-him',
        kitHimAssetId,
        0,
        'For Baby',
        '7 items',
        '/shop?kit=for-baby',
        kitBabyAssetId,
        1,
        'For Her',
        '8 items',
        '/shop?kit=for-her',
        kitHerAssetId,
        2,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`gift_kits\` DROP FOREIGN KEY \`FK_gift_kits_asset\``,
    );
    await queryRunner.query(`DROP TABLE \`gift_kits\``);
    await queryRunner.query(
      `ALTER TABLE \`sale_banners\` DROP FOREIGN KEY \`FK_sale_banners_asset\``,
    );
    await queryRunner.query(`DROP TABLE \`sale_banners\``);
    await queryRunner.query(
      `ALTER TABLE \`promo_banners\` DROP FOREIGN KEY \`FK_promo_banners_asset\``,
    );
    await queryRunner.query(`DROP TABLE \`promo_banners\``);
  }
}
