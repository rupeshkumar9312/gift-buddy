import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginActivity1787442027528 implements MigrationInterface {
  name = 'AddLoginActivity1787442027528';

  // Trimmed by hand from the raw `migration:generate` output, same as every
  // other migration in this project — the generator also proposed dropping
  // and recreating unrelated foreign keys to reconcile cosmetic ON UPDATE
  // RESTRICT vs NO ACTION drift. This migration only creates the one new
  // `login_activity` audit table.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`login_activity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`actorType\` varchar(20) NOT NULL, \`user_id\` int NULL, \`admin_user_id\` int NULL, \`method\` varchar(30) NOT NULL, \`ipAddress\` varchar(45) NOT NULL, \`userAgent\` text NULL, \`city\` varchar(100) NULL, \`region\` varchar(100) NULL, \`country\` varchar(100) NULL, \`latitude\` decimal(9,6) NULL, \`longitude\` decimal(9,6) NULL, \`locationSource\` varchar(10) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_login_activity_user_id\` (\`user_id\`), INDEX \`IDX_login_activity_admin_user_id\` (\`admin_user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_activity\` ADD CONSTRAINT \`FK_login_activity_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_activity\` ADD CONSTRAINT \`FK_login_activity_admin_user\` FOREIGN KEY (\`admin_user_id\`) REFERENCES \`admin_users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`login_activity\` DROP FOREIGN KEY \`FK_login_activity_admin_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`login_activity\` DROP FOREIGN KEY \`FK_login_activity_user\``,
    );
    await queryRunner.query(`DROP TABLE \`login_activity\``);
  }
}
