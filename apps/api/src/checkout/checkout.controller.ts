import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { OptionalJwtAccessGuard } from '../auth/guards/optional-jwt-access.guard';
import { CART_COOKIE } from '../cart/cart.controller';
import { CartIdentity } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller()
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Get('checkout/config')
  getCheckoutConfig() {
    return {
      gatewayEnabled: this.config.get<boolean>('payments.gatewayEnabled'),
    };
  }

  @Post('checkout')
  @UseGuards(OptionalJwtAccessGuard)
  async checkout(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Req() req: Request,
    @Body() dto: CheckoutDto,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const identity: CartIdentity = {
      userId: user?.userId ?? null,
      guestToken: cookies?.[CART_COOKIE] ?? null,
    };
    const result = await this.checkoutService.checkout(identity, dto);
    return {
      orderNumber: result.orderNumber,
      clientSecret: result.clientSecret ?? null,
      total: result.total,
      currency: result.currency,
      devMode: result.devMode,
      paymentMethod: result.paymentMethod,
      publishableKey:
        result.paymentMethod === 'card' && !this.paymentsService.isDevMode
          ? this.config.get<string>('stripe.publishableKey') || null
          : null,
    };
  }

  @Post('checkout/:orderNumber/dev-confirm')
  @HttpCode(HttpStatus.OK)
  async devConfirm(@Param('orderNumber') orderNumber: string) {
    await this.checkoutService.devConfirm(orderNumber);
    return { status: 'paid' };
  }

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    const event = this.paymentsService.constructWebhookEvent(
      req.rawBody,
      signature,
    );

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string };
      await this.checkoutService.confirmPaymentSucceeded(intent.id, event);
    }

    return { received: true };
  }
}
