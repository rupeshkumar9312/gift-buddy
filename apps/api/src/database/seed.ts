import * as argon2 from 'argon2';
import dataSource from './data-source';
import { Category } from '../categories/entities/category.entity';
import { MediaAsset } from '../media/entities/media-asset.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ShippingMethod } from '../shipping/entities/shipping-method.entity';
import { Permission } from '../admin/entities/permission.entity';
import { Role } from '../admin/entities/role.entity';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { User } from '../users/entities/user.entity';
import { Review } from '../reviews/entities/review.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Faq } from '../content/entities/faq.entity';
import { BlogPost } from '../content/entities/blog-post.entity';
import { seedCategories, seedProducts } from './seed-data';
import { seedPermissions, seedRoles, seedSuperAdmin } from './admin-seed-data';
import {
  seedBlogPosts,
  seedCoupons,
  seedCustomers,
  seedFaqs,
  seedReviews,
} from './engagement-seed-data';

const OLD_CREATED_AT = daysAgo(60);
const NEW_CREATED_AT = daysAgo(5);

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function seed() {
  await dataSource.initialize();
  console.log('Connected. Clearing existing catalog...');

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of [
    'wishlist_items',
    'wishlists',
    'reviews',
    'coupons',
    'newsletter_subscribers',
    'contact_messages',
    'faqs',
    'blog_posts',
    'users',
    'product_images',
    'products',
    'categories',
    'media_assets',
    'shipping_methods',
    'admin_users',
    'role_permissions',
    'roles',
    'permissions',
  ]) {
    await dataSource.query(`TRUNCATE TABLE \`${table}\``);
  }
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  const mediaRepo = dataSource.getRepository(MediaAsset);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const productImageRepo = dataSource.getRepository(ProductImage);

  console.log(`Seeding ${seedCategories.length} categories...`);
  const categoriesBySlug = new Map<string, Category>();
  for (const [index, source] of seedCategories.entries()) {
    const asset = await mediaRepo.save(
      mediaRepo.create({
        url: source.image,
        provider: 'picsum',
        altText: source.name,
      }),
    );
    const category = await categoryRepo.save(
      categoryRepo.create({
        slug: source.slug,
        name: source.name,
        imageAssetId: asset.id,
        sortOrder: index,
      }),
    );
    categoriesBySlug.set(source.slug, category);
  }

  console.log(`Seeding ${seedProducts.length} products...`);
  const productsBySlug = new Map<string, Product>();
  for (const source of seedProducts) {
    const category = categoriesBySlug.get(source.category);
    if (!category) {
      throw new Error(
        `Seed product "${source.slug}" references unknown category "${source.category}"`,
      );
    }

    const product = await productRepo.save(
      productRepo.create({
        slug: source.slug,
        sku: source.sku,
        name: source.name,
        description: source.description,
        price: source.price.toFixed(2),
        salePrice: source.salePrice ? source.salePrice.toFixed(2) : null,
        categoryId: category.id,
        ratingAvg: source.rating.toFixed(2),
        ratingCount: source.reviews,
        stockQty: source.inStock ? 40 : 0,
        isFeatured: source.isFeatured ?? false,
        isActive: true,
        createdAt: source.isNew ? NEW_CREATED_AT : OLD_CREATED_AT,
      }),
    );

    for (const [index, url] of source.gallery.entries()) {
      const asset = await mediaRepo.save(
        mediaRepo.create({ url, provider: 'picsum', altText: source.name }),
      );
      await productImageRepo.save(
        productImageRepo.create({
          productId: product.id,
          assetId: asset.id,
          sortOrder: index,
          isPrimary: index === 0,
        }),
      );
    }

    productsBySlug.set(product.slug, product);
  }

  console.log('Seeding shipping methods...');
  const shippingRepo = dataSource.getRepository(ShippingMethod);
  await shippingRepo.save(
    shippingRepo.create({
      name: 'Standard Shipping',
      price: '8.00',
      freeOverAmount: '99.00',
      sortOrder: 0,
    }),
  );

  console.log('Seeding permissions, roles, and the default admin user...');
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const adminUserRepo = dataSource.getRepository(AdminUser);

  const permissionsByKey = new Map<string, Permission>();
  for (const key of seedPermissions) {
    const permission = await permissionRepo.save(
      permissionRepo.create({ key }),
    );
    permissionsByKey.set(key, permission);
  }

  const rolesByName = new Map<string, Role>();
  for (const source of seedRoles) {
    const role = await roleRepo.save(
      roleRepo.create({
        name: source.name,
        description: source.description,
        permissions: source.permissions.map((key) => {
          const permission = permissionsByKey.get(key);
          if (!permission) {
            throw new Error(
              `Seed role "${source.name}" references unknown permission "${key}"`,
            );
          }
          return permission;
        }),
      }),
    );
    rolesByName.set(source.name, role);
  }

  const superAdminRole = rolesByName.get(seedSuperAdmin.roleName);
  if (!superAdminRole) {
    throw new Error(
      `Seed admin references unknown role "${seedSuperAdmin.roleName}"`,
    );
  }
  const superAdmin = await adminUserRepo.save(
    adminUserRepo.create({
      email: seedSuperAdmin.email,
      passwordHash: await argon2.hash(seedSuperAdmin.password),
      name: seedSuperAdmin.name,
      roleId: superAdminRole.id,
    }),
  );

  console.log(`Seeding ${seedCustomers.length} customers...`);
  const userRepo = dataSource.getRepository(User);
  const usersByEmail = new Map<string, User>();
  for (const source of seedCustomers) {
    const user = await userRepo.save(
      userRepo.create({
        email: source.email,
        passwordHash: await argon2.hash(source.password),
        firstName: source.firstName,
        lastName: source.lastName,
      }),
    );
    usersByEmail.set(source.email, user);
  }

  console.log(`Seeding ${seedReviews.length} reviews...`);
  const reviewRepo = dataSource.getRepository(Review);
  for (const source of seedReviews) {
    const product = productsBySlug.get(source.productSlug);
    const user = usersByEmail.get(source.customerEmail);
    if (!product || !user) {
      throw new Error(
        `Seed review references unknown product "${source.productSlug}" or customer "${source.customerEmail}"`,
      );
    }
    await reviewRepo.save(
      reviewRepo.create({
        productId: product.id,
        userId: user.id,
        rating: source.rating,
        title: source.title,
        body: source.body,
        isApproved: source.isApproved,
        isFeatured: source.isFeatured,
      }),
    );
  }

  console.log(`Seeding ${seedCoupons.length} coupons...`);
  const couponRepo = dataSource.getRepository(Coupon);
  for (const source of seedCoupons) {
    await couponRepo.save(couponRepo.create(source));
  }

  console.log(`Seeding ${seedFaqs.length} FAQs...`);
  const faqRepo = dataSource.getRepository(Faq);
  for (const source of seedFaqs) {
    await faqRepo.save(faqRepo.create(source));
  }

  console.log(`Seeding ${seedBlogPosts.length} blog posts...`);
  const blogRepo = dataSource.getRepository(BlogPost);
  for (const source of seedBlogPosts) {
    const coverAsset = await mediaRepo.save(
      mediaRepo.create({
        url: source.coverImage,
        provider: 'picsum',
        altText: source.title,
      }),
    );
    await blogRepo.save(
      blogRepo.create({
        slug: source.slug,
        title: source.title,
        excerpt: source.excerpt,
        content: source.content,
        coverAssetId: coverAsset.id,
        authorAdminId: superAdmin.id,
        status: source.status,
        publishedAt: source.publishedAt,
      }),
    );
  }

  console.log('Seed complete.');
  await dataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
