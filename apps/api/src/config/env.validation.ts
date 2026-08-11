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
