import dataSource from './data-source';
import { Category } from '../categories/entities/category.entity';
import { MediaAsset } from '../media/entities/media-asset.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { seedCategories, seedProducts } from './seed-data';

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
    'product_images',
    'products',
    'categories',
    'media_assets',
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
  }

  console.log('Seed complete.');
  await dataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
