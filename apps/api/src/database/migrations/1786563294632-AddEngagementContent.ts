import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEngagementContent1786563294632 implements MigrationInterface {
  name = 'AddEngagementContent1786563294632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`wishlist_items\` (\`wishlist_id\` int NOT NULL, \`product_id\` int NOT NULL, \`added_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`wishlist_id\`, \`product_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wishlists\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b5e6331a1a7d61c25d7a25cab8\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`user_id\` int NOT NULL, \`rating\` tinyint NOT NULL, \`title\` varchar(200) NOT NULL, \`body\` text NOT NULL, \`isApproved\` tinyint NOT NULL DEFAULT 0, \`isFeatured\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_43968e5855f331f4f1355a3fb2\` (\`product_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupons\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(40) NOT NULL, \`type\` varchar(10) NOT NULL DEFAULT 'percent', \`value\` decimal(10,2) NOT NULL, \`minSubtotal\` decimal(10,2) NOT NULL DEFAULT '0.00', \`startsAt\` datetime NULL, \`expiresAt\` datetime NULL, \`usageLimit\` int NULL, \`timesUsed\` int NOT NULL DEFAULT '0', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e025109230e82925843f2a14c4\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`newsletter_subscribers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`subscribed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`unsubscribedAt\` datetime NULL, UNIQUE INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`faqs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group\` varchar(20) NOT NULL, \`question\` varchar(255) NOT NULL, \`answer\` text NOT NULL, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`contact_messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`email\` varchar(255) NOT NULL, \`subject\` varchar(255) NULL, \`message\` text NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'new', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blog_posts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(220) NOT NULL, \`title\` varchar(220) NOT NULL, \`excerpt\` varchar(500) NOT NULL, \`content\` text NOT NULL, \`cover_asset_id\` int NULL, \`author_admin_id\` int NULL, \`status\` varchar(20) NOT NULL DEFAULT 'draft', \`publishedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_5b2818a2c45c3edb9991b1c7a5\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` ADD \`couponCode\` varchar(40) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlist_items\` ADD CONSTRAINT \`FK_754a9ecec7627d432c2134dd00e\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlists\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlist_items\` ADD CONSTRAINT \`FK_177397e044732e7e9c0215cd5b7\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlists\` ADD CONSTRAINT \`FK_b5e6331a1a7d61c25d7a25cab8f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_9482e9567d8dcc2bc615981ef44\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_728447781a30bc3fcfe5c2f1cdf\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blog_posts\` ADD CONSTRAINT \`FK_1f4f9e69b1d21c818bc8ceb8525\` FOREIGN KEY (\`cover_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`blog_posts\` ADD CONSTRAINT \`FK_888a1c4c4f85b38c45d7a8ab769\` FOREIGN KEY (\`author_admin_id\`) REFERENCES \`admin_users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`blog_posts\` DROP FOREIGN KEY \`FK_888a1c4c4f85b38c45d7a8ab769\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`blog_posts\` DROP FOREIGN KEY \`FK_1f4f9e69b1d21c818bc8ceb8525\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_728447781a30bc3fcfe5c2f1cdf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_9482e9567d8dcc2bc615981ef44\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlists\` DROP FOREIGN KEY \`FK_b5e6331a1a7d61c25d7a25cab8f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_177397e044732e7e9c0215cd5b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_754a9ecec7627d432c2134dd00e\``,
    );
    await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`couponCode\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5b2818a2c45c3edb9991b1c7a5\` ON \`blog_posts\``,
    );
    await queryRunner.query(`DROP TABLE \`blog_posts\``);
    await queryRunner.query(`DROP TABLE \`contact_messages\``);
    await queryRunner.query(`DROP TABLE \`faqs\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` ON \`newsletter_subscribers\``,
    );
    await queryRunner.query(`DROP TABLE \`newsletter_subscribers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e025109230e82925843f2a14c4\` ON \`coupons\``,
    );
    await queryRunner.query(`DROP TABLE \`coupons\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_43968e5855f331f4f1355a3fb2\` ON \`reviews\``,
    );
    await queryRunner.query(`DROP TABLE \`reviews\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_b5e6331a1a7d61c25d7a25cab8\` ON \`wishlists\``,
    );
    await queryRunner.query(`DROP TABLE \`wishlists\``);
    await queryRunner.query(`DROP TABLE \`wishlist_items\``);
  }
}
