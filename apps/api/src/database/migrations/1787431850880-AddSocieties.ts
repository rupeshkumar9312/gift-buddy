import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocieties1787431850880 implements MigrationInterface {
  name = 'AddSocieties1787431850880';

  // Trimmed by hand from the raw `migration:generate` output, same as every
  // other migration in this project — the generator also proposed dropping
  // and recreating unrelated foreign keys to reconcile cosmetic ON UPDATE
  // RESTRICT vs NO ACTION drift. This migration only creates the one new
  // `societies` table and seeds the two societies already in use.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`societies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      'INSERT INTO `societies` (`name`, `isActive`) VALUES (?, ?), (?, ?)',
      ['The Golden Palms', true, 'Paras Seasons', true],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`societies\``);
  }
}
