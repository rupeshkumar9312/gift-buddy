export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'giftbuddy',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessTtlSeconds: 15 * 60,
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshTtlSeconds: 30 * 24 * 60 * 60,
    refreshTtlMs: 30 * 24 * 60 * 60 * 1000,
  },
  adminJwt: {
    // Audience claim keeps an admin token from being replayed on customer
    // routes (and vice versa) even if a secret were ever shared by mistake.
    audience: 'giftbuddy-admin',
    accessSecret: process.env.ADMIN_JWT_ACCESS_SECRET ?? '',
    accessTtlSeconds: 60 * 60,
    refreshSecret: process.env.ADMIN_JWT_REFRESH_SECRET ?? '',
    refreshTtlSeconds: 7 * 24 * 60 * 60,
    refreshTtlMs: 7 * 24 * 60 * 60 * 1000,
  },
  cart: {
    // Guest cart identity cookie — mirrors the refresh token cookie pattern.
    cookieTtlMs: 30 * 24 * 60 * 60 * 1000,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret:
      process.env.STRIPE_WEBHOOK_SECRET ?? 'dev-webhook-secret-change-me',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
  },
  payments: {
    // Off by default: checkout runs Cash on Delivery only, no Stripe
    // PaymentIntent is ever created. Set to 'true' to route checkout
    // through Stripe (or its dev simulator — see PaymentsService).
    gatewayEnabled: (process.env.PAYMENT_GATEWAY_ENABLED ?? 'false') === 'true',
  },
  mail: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
    from: process.env.MAIL_FROM ?? 'GiftBuddy <orders@giftbuddy.test>',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
});
