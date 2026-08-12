import { randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export type CreatedPaymentIntent = {
  id: string;
  clientSecret: string;
};

/**
 * Wraps the Stripe SDK. When STRIPE_SECRET_KEY is unset (default for local
 * dev / this demo), payment-intent creation falls back to a local simulator
 * so the full order lifecycle — checkout, webhook, stock decrement, email —
 * is exercisable without a real Stripe account. Webhook signature
 * verification always uses the real `stripe` library (it's a pure HMAC over
 * STRIPE_WEBHOOK_SECRET and doesn't touch the network), so that part of the
 * pipeline is identical in both modes. Drop in real test-mode keys to switch
 * addItem/checkout over to the actual Stripe API.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;
  readonly isDevMode: boolean;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>('stripe.secretKey') || '';
    this.isDevMode = secretKey.length === 0;
    this.stripe = new Stripe(secretKey || 'sk_test_dev_mode_placeholder', {
      apiVersion: '2026-07-29.dahlia',
    });
    if (this.isDevMode) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — using the local dev payment simulator, no real Stripe API calls will be made.',
      );
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<CreatedPaymentIntent> {
    if (this.isDevMode) {
      const id = `pi_dev_${randomBytes(12).toString('hex')}`;
      return {
        id,
        clientSecret: `${id}_secret_${randomBytes(8).toString('hex')}`,
      };
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return { id: intent.id, clientSecret: intent.client_secret! };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.getOrThrow<string>(
      'stripe.webhookSecret',
    );
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  /** Test-only helper: signs a fake event the same way Stripe would. */
  generateTestWebhookHeader(payload: string): string {
    const webhookSecret = this.config.getOrThrow<string>(
      'stripe.webhookSecret',
    );
    return this.stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });
  }
}
