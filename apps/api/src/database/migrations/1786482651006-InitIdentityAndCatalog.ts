import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitIdentityAndCatalog1786482651006 implements MigrationInterface {
  name = 'InitIdentityAndCatalog1786482651006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`addresses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`label\` varchar(60) NOT NULL DEFAULT 'Home', \`line1\` varchar(255) NOT NULL, \`line2\` varchar(255) NULL, \`city\` varchar(120) NOT NULL, \`region\` varchar(120) NOT NULL, \`postalCode\` varchar(20) NOT NULL, \`country\` varchar(2) NOT NULL, \`isDefault\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`firstName\` varchar(120) NOT NULL, \`lastName\` varchar(120) NOT NULL, \`phone\` varchar(30) NULL, \`role\` varchar(20) NOT NULL DEFAULT 'customer', \`emailVerifiedAt\` datetime NULL, \`refreshTokenHash\` varchar(255) NULL, \`refreshTokenExpiresAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`media_assets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(2048) NOT NULL, \`provider\` varchar(50) NOT NULL DEFAULT 'external', \`width\` int NULL, \`height\` int NULL, \`altText\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(160) NOT NULL, \`name\` varchar(160) NOT NULL, \`image_asset_id\` int NULL, \`parent_id\` int NULL, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_420d9f679d41281f282f5bc7d0\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`asset_id\` int NOT NULL, \`sortOrder\` int NOT NULL DEFAULT '0', \`isPrimary\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(200) NOT NULL, \`sku\` varchar(60) NOT NULL, \`name\` varchar(200) NOT NULL, \`description\` text NOT NULL, \`price\` decimal(10,2) NOT NULL, \`salePrice\` decimal(10,2) NULL, \`category_id\` int NOT NULL, \`ratingAvg\` decimal(3,2) NOT NULL DEFAULT '0.00', \`ratingCount\` int NOT NULL DEFAULT '0', \`stockQty\` int NOT NULL DEFAULT '0', \`isFeatured\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_464f927ae360106b783ed0b410\` (\`slug\`), UNIQUE INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`addresses\` ADD CONSTRAINT \`FK_16aac8a9f6f9c1dd6bcb75ec023\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_3cc005549bccdacb6aeeba0ec2f\` FOREIGN KEY (\`image_asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_88cea2dc9c31951d06437879b40\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_ad9ffec019188ea90875b553919\` FOREIGN KEY (\`asset_id\`) REFERENCES \`media_assets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_9a5f6868c96e0069e699f33e124\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_9a5f6868c96e0069e699f33e124\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_ad9ffec019188ea90875b553919\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_88cea2dc9c31951d06437879b40\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_3cc005549bccdacb6aeeba0ec2f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_16aac8a9f6f9c1dd6bcb75ec023\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` ON \`products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_464f927ae360106b783ed0b410\` ON \`products\``,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(`DROP TABLE \`product_images\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_420d9f679d41281f282f5bc7d0\` ON \`categories\``,
    );
    await queryRunner.query(`DROP TABLE \`categories\``);
    await queryRunner.query(`DROP TABLE \`media_assets\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`addresses\``);
  }
}
