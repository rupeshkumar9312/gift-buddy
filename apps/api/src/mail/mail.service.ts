import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.getOrThrow<string>('mail.from');
    this.transporter = createTransport({
      host: this.config.getOrThrow<string>('mail.host'),
      port: this.config.getOrThrow<number>('mail.port'),
      secure: false,
    });
  }

  async sendOrderConfirmation(params: {
    to: string;
    orderNumber: string;
    total: number;
    currency: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: `Your GiftBuddy order ${params.orderNumber} is confirmed`,
        text: `Thanks for your order!\n\nOrder ${params.orderNumber}\nTotal: ${params.total.toFixed(2)} ${params.currency.toUpperCase()}\n\nWe'll email you again once it ships.`,
        html: `<p>Thanks for your order!</p><p><strong>Order ${params.orderNumber}</strong><br/>Total: ${params.total.toFixed(2)} ${params.currency.toUpperCase()}</p><p>We'll email you again once it ships.</p>`,
      });
    } catch (error) {
      // Email is a best-effort side effect of payment confirmation — never
      // let an SMTP hiccup fail the webhook and cause Stripe to retry it.
      this.logger.error(
        `Failed to send order confirmation email: ${String(error)}`,
      );
    }
  }
}
