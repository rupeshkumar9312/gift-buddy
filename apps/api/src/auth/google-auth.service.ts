import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class GoogleAuthService {
  private readonly configured: boolean;
  private readonly client: OAuth2Client | null;
  private readonly clientId: string;

  constructor(config: ConfigService) {
    this.clientId = config.get<string>('google.clientId') ?? '';
    this.configured = Boolean(this.clientId);
    this.client = this.configured ? new OAuth2Client(this.clientId) : null;
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!this.configured || !this.client) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured — set GOOGLE_CLIENT_ID.',
      );
    }

    const payload = await this.client
      .verifyIdToken({ idToken, audience: this.clientId })
      .then((ticket) => ticket.getPayload())
      .catch(() => null);

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google sign-in token');
    }
    if (!payload.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name ?? '',
      lastName: payload.family_name ?? '',
    };
  }
}
