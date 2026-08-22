import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuth1787411877255 implements MigrationInterface {
  name = 'AddGoogleAuth1787411877255';

  // Trimmed by hand from the raw `migration:generate` output, same as the
  // Occasions migrations — the generator also proposed dropping and
  // recreating nearly every foreign key in the database just to reconcile
  // cosmetic ON UPDATE RESTRICT vs NO ACTION drift. This migration only
  // adds the one column and index Google sign-in needs.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`googleId\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_f382af58ab36057334fb262efd\` (\`googleId\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_f382af58ab36057334fb262efd\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`googleId\``);
  }
}
