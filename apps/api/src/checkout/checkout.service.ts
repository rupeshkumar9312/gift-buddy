import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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
import { UsersService } from '../users/users.service';
import { CheckoutDto } from './dto/checkout.dto';
import { AddressDto } from './dto/address.dto';

export type CheckoutResult = {
  orderNumber: string;
  clientSecret?: string;
  total: number;
  currency: string;
  devMode: boolean;
  paymentMethod: 'card' | 'cod';
};

// Structurally matches admin/orders/dto/create-admin-order.dto.ts —
// defined here instead of importing that DTO so this module doesn't
// depend on the admin layer; the admin controller just passes its
// validated dto straight through, which satisfies this by shape.
export type ManualOrderInput = {
  email: string;
  shippingAddress: AddressDto;
  items: { productId: number; quantity: number }[];
  shippingMethodId: number;
  paymentMethod: 'cod' | 'paid';
  note?: string;
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

// The order can't ship before its slowest item is ready, so this takes the
// max across every line's product override rather than e.g. the first item.
// Null (the common case — every item is same-day eligible) leaves the
// existing 5PM-cutoff logic in charge, unchanged.
function computeDeliveryExtraDays(
  products: { deliveryEstimateDays: number | null }[],
): number | null {
  const days = products.map((p) => p.deliveryEstimateDays ?? 0);
  const max = Math.max(0, ...days);
  return max > 0 ? max : null;
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
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /** MySQL's deadlock detector guarantees it only ever kills one side of a
   * genuine deadlock and rolls it back cleanly — the standard, correct
   * response is to retry, not to surface it to the customer as a failure.
   * Concurrent checkouts for carts containing the same products in a
   * different order can deadlock this way even with the lock-ordering
   * fix in decrementStock() below. */
  private async runWithDeadlockRetry<T>(
    work: (manager: EntityManager) => Promise<T>,
    attempt = 1,
  ): Promise<T> {
    try {
      return await this.dataSource.transaction(work);
    } catch (error) {
      const isDeadlock =
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === 'ER_LOCK_DEADLOCK';
      if (isDeadlock && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 50));
        return this.runWithDeadlockRetry(work, attempt + 1);
      }
      throw error;
    }
  }

  /** Reserves stock for every order at creation time (card and COD alike).
   * The `stockQty >= :qty` guard makes this atomic under concurrency: two
   * requests racing to decrement the same row serialize at the row lock —
   * InnoDB always writes against the latest committed value, not a
   * snapshot, so whichever UPDATE runs first wins and the second sees the
   * already-reduced value. If it can't reserve the full quantity, the
   * whole order-creation transaction rolls back — no order, no
   * PaymentIntent, no partial decrement. */
  private async decrementStock(
    manager: EntityManager,
    orderItems: OrderItem[],
  ): Promise<void> {
    for (const item of orderItems) {
      if (!item.productId) continue;
      const result = await manager
        .createQueryBuilder()
        .update(Product)
        .set({ stockQty: () => 'stockQty - :qty' })
        .where('id = :id AND stockQty >= :qty', {
          id: item.productId,
          qty: item.quantity,
        })
        .execute();
      if (result.affected === 0) {
        throw new ConflictException(
          `${item.productName} is no longer available in that quantity`,
        );
      }
    }
  }

  /** The inverse of decrementStock — used when a reserved order's payment
   * fails, is canceled, or is abandoned. Increments have no lower bound to
   * violate, so this needs no guard clause. */
  private async incrementStock(
    manager: EntityManager,
    orderItems: OrderItem[],
  ): Promise<void> {
    for (const item of orderItems) {
      if (item.productId) {
        await manager.increment(
          Product,
          { id: item.productId },
          'stockQty',
          item.quantity,
        );
      }
    }
  }

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

    // Fast-path only — a plain read against potentially-stale data, purely
    // to avoid a wasted transaction for the common case. Not a race guard:
    // decrementStock() below, inside the transaction, is what actually
    // enforces availability atomically.
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
    const currency = cart.currency ?? 'inr';
    const shippingAddress = toOrderAddress(dto.shippingAddress);
    const billingAddress = dto.billingAddress
      ? toOrderAddress(dto.billingAddress)
      : shippingAddress;

    const gatewayEnabled = this.config.get<boolean>('payments.gatewayEnabled');

    // Order is created (and the cart retired) in its own transaction before
    // ever calling out to Stripe — mirrors Fig. 3 in the analysis doc, so a
    // Stripe outage never leaves a half-written order row. Stock is reserved
    // in this same transaction for every order, card or COD: reserving only
    // on payment confirmation (the old card-path behavior) left a window of
    // however long the customer takes to pay during which two people could
    // both be shown "in stock" for the same last unit. Reserving atomically
    // at creation closes that window; see decrementStock() below for how.
    const order = await this.runWithDeadlockRetry(async (manager) => {
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
        deliveryExtraDays: computeDeliveryExtraDays(
          items.map((item) => item.product),
        ),
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

      // Reserved for every order now, not just COD — throws (rolling back
      // the whole transaction) if any item can't be fully reserved. Done
      // *before* order_items is inserted, and deliberately so: order_items
      // has a foreign key to products, and an INSERT there takes a shared
      // lock on the referenced product row for the FK check. If both
      // sides of a race took that shared lock first and then tried to
      // upgrade to the exclusive lock this UPDATE needs, that's a
      // guaranteed lock-upgrade deadlock (each waiting on the other's
      // shared lock) rather than a clean wait. Taking the exclusive lock
      // first avoids the upgrade entirely — the loser just waits for the
      // row, then sees the reduced stock.
      await this.decrementStock(manager, orderItems);

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

      if (!gatewayEnabled) {
        savedOrder.placedAt = new Date();
        await manager.save(Order, savedOrder);

        await manager.save(
          Payment,
          manager.create(Payment, {
            orderId: savedOrder.id,
            provider: 'cod',
            providerRef: `cod_${savedOrder.orderNumber}`,
            amount: total.toFixed(2),
            status: PaymentStatus.REQUIRES_PAYMENT,
          }),
        );
      }

      return savedOrder;
    });

    await this.cartService.markConverted(cart);

    if (!gatewayEnabled) {
      // No Stripe webhook will ever fire for this order, so send the
      // confirmation right away instead of waiting on confirmPaymentSucceeded.
      await this.mailService.sendOrderConfirmation({
        to: order.email,
        orderNumber: order.orderNumber,
        total,
        currency,
      });

      return {
        orderNumber: order.orderNumber,
        total,
        currency,
        devMode: false,
        paymentMethod: 'cod',
      };
    }

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
      paymentMethod: 'card',
    };
  }

  /**
   * Creates an order on a customer's behalf from the admin panel — a phone
   * order, a walk-in sale, anything entered by staff rather than placed
   * through the storefront. There's no cart and no Stripe: payment is
   * either 'cod' (identical to a customer's Cash on Delivery order — stays
   * pending_payment until cash is collected, same as today) or 'paid' (the
   * admin is confirming money already changed hands some other way — cash
   * in person, bank transfer, UPI — so the order starts life already paid).
   * Reuses the same deadlock-safe stock reservation as a real checkout so
   * an admin-entered order can't oversell a product any more than a
   * storefront one can.
   */
  async createManualOrder(input: ManualOrderInput): Promise<Order> {
    const productIds = input.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds), isActive: true },
      relations: ['images', 'images.asset'],
    });
    const productsById = new Map(products.map((p) => [p.id, p]));

    for (const item of input.items) {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      if (item.quantity > product.stockQty) {
        throw new BadRequestException(
          `${product.name} only has ${product.stockQty} left in stock`,
        );
      }
    }

    const shippingMethod = await this.shippingService.findById(
      input.shippingMethodId,
    );

    const subtotal = input.items.reduce((sum, item) => {
      const product = productsById.get(item.productId)!;
      const price = Number(product.salePrice ?? product.price);
      return sum + price * item.quantity;
    }, 0);
    const shippingTotal = this.shippingService.costFor(
      shippingMethod,
      subtotal,
    );
    const total = Math.round((subtotal + shippingTotal) * 100) / 100;
    const currency = 'inr';
    const shippingAddress = toOrderAddress(input.shippingAddress);
    const user = await this.usersService.findByEmail(input.email);
    const isPaid = input.paymentMethod === 'paid';

    const order = await this.runWithDeadlockRetry(async (manager) => {
      const created = manager.create(Order, {
        orderNumber: generateOrderNumber(),
        userId: user?.id ?? null,
        email: input.email,
        status: isPaid ? OrderStatus.PAID : OrderStatus.PENDING_PAYMENT,
        subtotal: subtotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        taxTotal: '0.00',
        discountTotal: '0.00',
        total: total.toFixed(2),
        currency,
        shippingAddress,
        billingAddress: shippingAddress,
        shippingMethodName: shippingMethod.name,
        placedAt: new Date(),
        deliveryExtraDays: computeDeliveryExtraDays(
          input.items.map((item) => productsById.get(item.productId)!),
        ),
      });
      const savedOrder = await manager.save(Order, created);

      const orderItems = input.items.map((item) => {
        const product = productsById.get(item.productId)!;
        return manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          sku: product.sku,
          productImage: product.images?.[0]?.asset?.url ?? null,
          unitPrice: (product.salePrice ?? product.price).toString(),
          quantity: item.quantity,
          lineTotal: (
            Number(product.salePrice ?? product.price) * item.quantity
          ).toFixed(2),
        });
      });

      await this.decrementStock(manager, orderItems);
      await manager.save(OrderItem, orderItems);

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: savedOrder.id,
          fromStatus: null,
          toStatus: created.status,
          note: input.note
            ? `Created by admin — ${input.note}`
            : 'Order created by admin',
        }),
      );

      await manager.save(
        Payment,
        manager.create(Payment, {
          orderId: savedOrder.id,
          provider: isPaid ? 'manual' : 'cod',
          providerRef: `${isPaid ? 'manual' : 'cod'}_${savedOrder.orderNumber}`,
          amount: total.toFixed(2),
          status: isPaid
            ? PaymentStatus.SUCCEEDED
            : PaymentStatus.REQUIRES_PAYMENT,
        }),
      );

      return savedOrder;
    });

    await this.mailService.sendOrderConfirmation({
      to: order.email,
      orderNumber: order.orderNumber,
      total,
      currency,
    });

    return order;
  }

  /**
   * Marks an order paid from its Stripe PaymentIntent id — called by the
   * webhook handler (and, in dev mode only, the dev-confirm bypass). Keyed
   * on payments.provider_ref so a duplicate Stripe retry is a no-op. Stock
   * is NOT decremented here — it was already reserved when the order was
   * created (see checkout() / decrementStock()); this only flips status.
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

    const order = await this.runWithDeadlockRetry(async (manager) => {
      const orderRow = await manager.findOneOrFail(Order, {
        where: { id: payment.orderId },
      });

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
   * Releases a reserved-but-never-paid card order's stock back to
   * inventory — called from the webhook on `payment_intent.payment_failed`
   * / `payment_intent.canceled`, and from the abandoned-order sweep below.
   * A no-op if the order has already moved past PENDING_PAYMENT (paid, or
   * already released by whichever of the two paths got there first).
   */
  private async releaseStock(order: Order, note: string): Promise<void> {
    await this.runWithDeadlockRetry(async (manager) => {
      // Atomic guard against the webhook and the abandoned-order sweep
      // both trying to release the same order at once: only the request
      // that actually flips PENDING_PAYMENT -> CANCELLED proceeds to
      // increment stock. The other sees affected === 0 and is a no-op —
      // same "conditional UPDATE as the lock" pattern as decrementStock().
      const result = await manager
        .createQueryBuilder()
        .update(Order)
        .set({ status: OrderStatus.CANCELLED })
        .where('id = :id AND status = :pending', {
          id: order.id,
          pending: OrderStatus.PENDING_PAYMENT,
        })
        .execute();
      if (result.affected === 0) {
        return;
      }

      const orderItems = await manager.find(OrderItem, {
        where: { orderId: order.id },
      });
      await this.incrementStock(manager, orderItems);

      const payment = await manager.findOne(Payment, {
        where: { orderId: order.id },
      });
      if (payment) {
        payment.status = PaymentStatus.FAILED;
        await manager.save(Payment, payment);
      }

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          orderId: order.id,
          fromStatus: OrderStatus.PENDING_PAYMENT,
          toStatus: OrderStatus.CANCELLED,
          note,
        }),
      );
    });
  }

  /** Webhook entry point for a card payment that definitively did not
   * succeed — see releaseStock() for what this actually does. */
  async releaseStockForFailedPayment(providerRef: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { providerRef },
    });
    if (!payment) {
      this.logger.warn(
        `Received payment failure for unknown providerRef ${providerRef}`,
      );
      return;
    }
    const order = await this.orderRepository.findOne({
      where: { id: payment.orderId },
    });
    if (!order) return;

    await this.releaseStock(
      order,
      'Payment failed or canceled — stock released',
    );
  }

  /** Safety net for abandonments that never produce a webhook at all (the
   * customer closes the tab before Stripe ever tells us anything). Finds
   * card orders that have sat unpaid past the configured TTL and releases
   * their stock the same way. Called on a schedule — see
   * CheckoutCleanupService. */
  async releaseAbandonedOrders(): Promise<number> {
    const ttlMinutes = this.config.getOrThrow<number>(
      'checkout.abandonedOrderTtlMinutes',
    );
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);

    const abandoned = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin(Payment, 'payment', 'payment.order_id = order.id')
      .where('order.status = :status', {
        status: OrderStatus.PENDING_PAYMENT,
      })
      .andWhere('payment.provider = :provider', { provider: 'stripe' })
      .andWhere('order.createdAt < :cutoff', { cutoff })
      .getMany();

    for (const order of abandoned) {
      await this.releaseStock(order, 'Abandoned checkout — stock released');
    }

    return abandoned.length;
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
