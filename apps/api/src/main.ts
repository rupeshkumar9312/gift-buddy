import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  // This app is always deployed behind a reverse proxy (Render, and
  // Cloudflare in front of that) — without this, req.ip is just the
  // proxy's own address for every request, which breaks both IP-based
  // login-activity geolocation and per-client rate limiting.
  (app.getHttpAdapter().getInstance() as Express).set('trust proxy', true);

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const corsOrigins = config.get<string[]>('corsOrigins') ?? [];
  if (corsOrigins.length === 0) {
    // An empty allowlist means enableCors rejects every browser origin —
    // every client-side fetch fails with an opaque "Failed to fetch" and no
    // indication CORS was the cause. Loud at boot beats silent in prod.
    console.warn(
      'WARNING: CORS_ORIGINS is empty — no browser origin will be allowed to call this API. Set CORS_ORIGINS to a comma-separated list of allowed origins.',
    );
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = config.get<number>('port') ?? 3001;
  await app.listen(port);

  console.log(`GiftBuddy API listening on http://localhost:${port}`);
}
void bootstrap();
