import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  @IsOptional()
  NODE_ENV: string = 'development';

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = 'http://localhost:3000,http://localhost:3002';

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @IsOptional()
  DB_PORT: number = 3306;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string = '';

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  // Separate signing secrets from the customer JWTs — an admin token must
  // never be accepted on a customer route or vice versa.
  @IsString()
  @IsNotEmpty()
  ADMIN_JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_JWT_REFRESH_SECRET: string;

  // Optional: when unset, PaymentsService falls back to a local dev PaymentIntent
  // simulator so checkout still works end to end without a real Stripe account.
  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY: string = '';

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET: string = 'dev-webhook-secret-change-me';

  @IsString()
  @IsOptional()
  STRIPE_PUBLISHABLE_KEY: string = '';

  @IsString()
  @IsOptional()
  SMTP_HOST: string = 'localhost';

  @IsInt()
  @IsOptional()
  SMTP_PORT: number = 1025;

  @IsString()
  @IsOptional()
  MAIL_FROM: string = 'GiftBuddy <orders@giftbuddy.test>';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(
      `Invalid environment configuration — check apps/api/.env against .env.example:\n${messages}`,
    );
  }

  return validatedConfig;
}
