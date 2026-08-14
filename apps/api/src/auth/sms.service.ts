import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

// Unlike MailService, send failures here are NOT swallowed — an OTP send is
// the primary action of the request, not a best-effort side effect, so the
// caller (and ultimately the user) needs to know when it didn't go out.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly configured: boolean;
  private readonly client: Twilio | null;
  private readonly fromNumber: string;

  constructor(config: ConfigService) {
    const accountSid = config.get<string>('twilio.accountSid') ?? '';
    const authToken = config.get<string>('twilio.authToken') ?? '';
    this.fromNumber = config.get<string>('twilio.fromNumber') ?? '';

    this.configured = Boolean(accountSid && authToken && this.fromNumber);
    this.client = this.configured ? new Twilio(accountSid, authToken) : null;
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.configured || !this.client) {
      throw new ServiceUnavailableException(
        'SMS is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.',
      );
    }

    try {
      await this.client.messages.create({ to, from: this.fromNumber, body });
    } catch (error) {
      // Twilio errors carry a caller-safe `message` (invalid number, trial
      // account restrictions, etc.) — log the full error for diagnosis but
      // only surface the message, not the raw SDK exception, to the client.
      this.logger.error(`Twilio send failed: ${String(error)}`);
      const message =
        error instanceof Error ? error.message : 'Failed to send SMS';
      throw new BadGatewayException(message);
    }
  }
}
