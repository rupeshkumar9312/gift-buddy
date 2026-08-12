import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartIdentity, CartService } from '../cart/cart.service';
import { ShippingService } from '../shipping/shipping.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import {
  Order,
  OrderAddress,
  OrderStatus,
} from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { MailService } from '../mail/mail.service';
import { CheckoutDto } from './dto/checkout.dto';

export type CheckoutResult = {
  orderNumber: string;
  clientSecret: string;
  total: number;
  currency: string;
  devMode: boolean;
};

function toOrderAddress(input: CheckoutDto['shippingAddress']): OrderAddress {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    line1: input.line1,
    line2: input.line2 ?? null,
    city: input.city,
    region: input.region,
    postalCode: input.postalCode,
    country: input.country,
    phone: input.phone ?? null,
  };
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = randomBytes(4).toString('hex').toUpperCase();
  return `GB-${date}-${suffix}`;
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly shippingService: ShippingService,
    private readonly couponsService: CouponsService,
    private readonly paymentsService: PaymentsService,
    private readonly mailService: MailService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async checkout(
    identity: CartIdentity,
    dto: CheckoutDto,
  ): Promise<CheckoutResult> {
    const cart = await this.cartService.findActiveCart(identity);
    if (!cart) {
      throw new BadRequestException('Your cart is empty');
    }

    const items = await this.cartService.loadItemsWithProducts(cart.id);
    if (items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    for (const item of items) {
      if (item.quantity > item.product.stockQty) {
        throw new BadRequestException(
          `${item.product.name} only has ${item.product.stockQty} left in stock`,
        );
      }
    }

    const shippingMethod = await this.shippingService.findById(
      dto.shippingMethodId,
    );

    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.product.salePrice ?? item.product.price);
      return sum + price * item.quantity;
    }, 0);
    const shippingTotal = this.shippingService.costFor(
      shippingMethod,
      subtotal,
    );

    // Re-resolved here rather than trusted from the cart preview — if the
    // coupon expired or hit its usage limit between apply and checkout, this
    // throws so the customer sees it instead of silently paying full price
    // for a discount the cart UI showed them.
    let discountTotal = 0;
    let appliedCouponId: number | null = null;
    if (cart.couponCode) {
      const coupon = await this.couponsService.resolve(
        cart.couponCode,
        subtotal,
      );
      discountTotal = this.couponsService.computeDiscount(coupon, subtotal);
      appliedCouponId = coupon.id;
    }

    const total =
      Math.round((subtotal + shippingTotal - discountTotal) * 100) / 100;
    const currency = cart.currency ?? 'usd';
    const shippingAddress = toOrderAddress(dto.shippingAddress);
    const billingAddress = dto.billingAddress
      ? toOrderAddress(dto.billingAddress)
      : shippingAddress;

    // Order is created (and the cart retired) in its own transaction before
    // ever calling out to Stripe — mirrors Fig. 3 in the analysis doc, so a
    // Stripe outage never leaves a half-written order row.
    const order = await this.dataSource.transaction(async (manager) => {
      const created = manager.create(Order, {
        orderNumber: generateOrderNumber(),
        userId: identity.userId,
        email: dto.email,
        status: OrderStatus.PENDING_PAYMENT,
        subtotal: subtotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        taxTotal: '0.00',
        discountTotal: discountTotal.toFixed(2),
        total: total.toFixed(2),
        currency,
        shippingAddress,
        billingAddress,
        shippingMethodName: shippingMethod.name,
      });
      const savedOrder = await manager.save(Order, created);

      const orderItems = items.map((item) =>
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          productName: item.product.name,
          productSlug: item.product.slug,
          sku: item.product.sku,
          productImage: item.product.images?.[0]?.asset?.url ?? null,
          unitPrice: (item.product.salePrice ?? item.product.price).toString(),
          quantity: item.quantity,
          lineTotal: (
            Number(item.product.salePrice ?? item.product.price) * item.quantity
          ).toFixed(2),
        }),
      );
      await manager.save(OrderItem, orderItems);

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: savedOrder.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING_PAYMENT,
          note: 'Order created at checkout',
        }),
      );

      if (appliedCouponId) {
        await this.couponsService.incrementUsage(appliedCouponId, manager);
      }

      return savedOrder;
    });

    await this.cartService.markConverted(cart);

    const intent = await this.paymentsService.createPaymentIntent(
      total,
      currency,
      {
        orderId: String(order.id),
        orderNumber: order.orderNumber,
      },
    );

    await this.paymentRepository.save(
      this.paymentRepository.create({
        orderId: order.id,
        provider: 'stripe',
        providerRef: intent.id,
        amount: total.toFixed(2),
        status: PaymentStatus.REQUIRES_PAYMENT,
      }),
    );

    return {
      orderNumber: order.orderNumber,
      clientSecret: intent.clientSecret,
      total,
      currency,
      devMode: this.paymentsService.isDevMode,
    };
  }

  /**
   * Marks an order paid from its Stripe PaymentIntent id — called by the
   * webhook handler (and, in dev mode only, the dev-confirm bypass). Keyed
   * on payments.provider_ref so a duplicate Stripe retry is a no-op instead
   * of double-decrementing stock.
   */
  async confirmPaymentSucceeded(
    providerRef: string,
    rawPayload: unknown,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { providerRef },
    });
    if (!payment) {
      this.logger.warn(
        `Received payment confirmation for unknown providerRef ${providerRef}`,
      );
      return;
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      return; // already processed — idempotent under Stripe's at-least-once retries
    }

    const order = await this.dataSource.transaction(async (manager) => {
      const orderRow = await manager.findOneOrFail(Order, {
        where: { id: payment.orderId },
      });
      const orderItems = await manager.find(OrderItem, {
        where: { orderId: orderRow.id },
      });

      for (const item of orderItems) {
        if (item.productId) {
          await manager.decrement(
            Product,
            { id: item.productId },
            'stockQty',
            item.quantity,
          );
        }
      }

      orderRow.status = OrderStatus.PAID;
      orderRow.placedAt = new Date();
      await manager.save(Order, orderRow);

      payment.status = PaymentStatus.SUCCEEDED;
      payment.rawPayload = rawPayload;
      await manager.save(Payment, payment);

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: orderRow.id,
          fromStatus: OrderStatus.PENDING_PAYMENT,
          toStatus: OrderStatus.PAID,
          note: 'Payment confirmed',
        }),
      );

      return orderRow;
    });

    await this.mailService.sendOrderConfirmation({
      to: order.email,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      currency: order.currency,
    });
  }

  /**
   * Dev-only bypass so the storefront checkout is fully clickable without a
   * real Stripe account: simulates the webhook for orders paid with the
   * local PaymentIntent simulator. Disabled whenever real Stripe keys are
   * configured — never reachable in a production Stripe integration.
   */
  async devConfirm(orderNumber: string): Promise<void> {
    if (!this.paymentsService.isDevMode) {
      throw new NotFoundException();
    }
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }
    const payment = await this.paymentRepository.findOne({
      where: { orderId: order.id },
    });
    if (!payment) {
      throw new NotFoundException(`No payment found for order ${orderNumber}`);
    }
    await this.confirmPaymentSucceeded(payment.providerRef, {
      source: 'dev-confirm',
    });
  }
}
