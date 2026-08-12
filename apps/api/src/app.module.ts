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
import { AdminAuthModule } from './admin/auth/admin-auth.module';
import { AdminDashboardModule } from './admin/dashboard/admin-dashboard.module';
import { AdminProductsModule } from './admin/products/admin-products.module';
import { AdminCategoriesModule } from './admin/categories/admin-categories.module';
import { AdminOrdersModule } from './admin/orders/admin-orders.module';
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
    AdminAuthModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCategoriesModule,
    AdminOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
