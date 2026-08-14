import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckoutService } from './checkout.service';

// Safety net for card-order stock reservations that never got released by
// the Stripe webhook — e.g. the customer closed the tab before Stripe ever
// had anything to tell us, or a webhook delivery was missed. Runs
// independently of the webhook path; see CheckoutService.releaseStock()
// for why the two can safely overlap without double-releasing stock.
@Injectable()
export class CheckoutCleanupService {
  private readonly logger = new Logger(CheckoutCleanupService.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async releaseAbandonedOrders(): Promise<void> {
    const released = await this.checkoutService.releaseAbandonedOrders();
    if (released > 0) {
      this.logger.log(
        `Released stock for ${released} abandoned card order(s).`,
      );
    }
  }
}
