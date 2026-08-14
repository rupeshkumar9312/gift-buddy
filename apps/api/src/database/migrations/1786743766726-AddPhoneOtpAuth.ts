import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneOtpAuth1786743766726 implements MigrationInterface {
  name = 'AddPhoneOtpAuth1786743766726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`otp_challenges\` (\`id\` int NOT NULL AUTO_INCREMENT, \`phone\` varchar(30) NOT NULL, \`codeHash\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`attempts\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9d82c1b7cd415f16e76d2cdc8a\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`phoneVerifiedAt\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`passwordHash\` \`passwordHash\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_a000cca60bcf04454e72769949\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`passwordHash\` \`passwordHash\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`phoneVerifiedAt\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9d82c1b7cd415f16e76d2cdc8a\` ON \`otp_challenges\``,
    );
    await queryRunner.query(`DROP TABLE \`otp_challenges\``);
  }
}
