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

  async sendOrderStatusUpdate(params: {
    to: string;
    orderNumber: string;
    status: string;
  }): Promise<void> {
    const label = params.status.replace(/_/g, ' ');
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: `Your GiftBuddy order ${params.orderNumber} is now ${label}`,
        text: `Order ${params.orderNumber} has been updated to: ${label}.`,
        html: `<p>Order <strong>${params.orderNumber}</strong> has been updated to: <strong>${label}</strong>.</p>`,
      });
    } catch (error) {
      // Best-effort, same rationale as sendOrderConfirmation above.
      this.logger.error(
        `Failed to send order status update email: ${String(error)}`,
      );
    }
  }

  async sendContactAck(params: { to: string; name: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: `We got your message, ${params.name}`,
        text: `Thanks for reaching out! We've received your message and will get back to you shortly.`,
        html: `<p>Thanks for reaching out, ${params.name}! We've received your message and will get back to you shortly.</p>`,
      });
    } catch (error) {
      // Best-effort, same rationale as sendOrderConfirmation above.
      this.logger.error(`Failed to send contact ack email: ${String(error)}`);
    }
  }

  async sendNewsletterWelcome(params: { to: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: `Welcome to the GiftBuddy newsletter`,
        text: `You're subscribed! We'll send news and special offers to this address.`,
        html: `<p>You're subscribed! We'll send news and special offers to this address.</p>`,
      });
    } catch (error) {
      // Best-effort, same rationale as sendOrderConfirmation above.
      this.logger.error(
        `Failed to send newsletter welcome email: ${String(error)}`,
      );
    }
  }
}
