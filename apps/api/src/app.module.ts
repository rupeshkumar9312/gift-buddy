import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { ShippingModule } from './shipping/shipping.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponsModule } from './coupons/coupons.module';
import { BlogModule } from './content/blog/blog.module';
import { FaqsModule } from './content/faqs/faqs.module';
import { ContactModule } from './content/contact/contact.module';
import { NewsletterModule } from './content/newsletter/newsletter.module';
import { AdminAuthModule } from './admin/auth/admin-auth.module';
import { AdminDashboardModule } from './admin/dashboard/admin-dashboard.module';
import { AdminProductsModule } from './admin/products/admin-products.module';
import { AdminCategoriesModule } from './admin/categories/admin-categories.module';
import { AdminOrdersModule } from './admin/orders/admin-orders.module';
import { AdminCouponsModule } from './admin/coupons/admin-coupons.module';
import { AdminReviewsModule } from './admin/reviews/admin-reviews.module';
import { AdminBlogModule } from './admin/blog/admin-blog.module';
import { AdminFaqsModule } from './admin/faqs/admin-faqs.module';
import { AdminContactMessagesModule } from './admin/contact-messages/admin-contact-messages.module';
import { AdminMediaModule } from './admin/media/admin-media.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    ShippingModule,
    CheckoutModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    CouponsModule,
    BlogModule,
    FaqsModule,
    ContactModule,
    NewsletterModule,
    AdminAuthModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminOrdersModule,
    AdminCouponsModule,
    AdminReviewsModule,
    AdminBlogModule,
    AdminFaqsModule,
    AdminContactMessagesModule,
    AdminMediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
