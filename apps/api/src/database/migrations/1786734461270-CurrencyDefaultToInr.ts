import { MigrationInterface, QueryRunner } from 'typeorm';

export class CurrencyDefaultToInr1786734461270 implements MigrationInterface {
  name = 'CurrencyDefaultToInr1786734461270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`currency\` \`currency\` varchar(3) NOT NULL DEFAULT 'inr'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` CHANGE \`currency\` \`currency\` varchar(3) NOT NULL DEFAULT 'inr'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`carts\` CHANGE \`currency\` \`currency\` varchar(3) NOT NULL DEFAULT 'usd'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`currency\` \`currency\` varchar(3) NOT NULL DEFAULT 'usd'`,
    );
  }
}
