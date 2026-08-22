import { Hero } from "@/components/home/Hero";
import { UspStrip } from "@/components/home/UspStrip";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { OccasionBanner } from "@/components/home/OccasionBanner";
import { PromoBanners } from "@/components/home/PromoBanners";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SaleBanners } from "@/components/home/SaleBanners";
import { GiftKits } from "@/components/home/GiftKits";
import { UnderPriceBanner } from "@/components/home/UnderPriceBanner";
import { ArticlesPreview } from "@/components/home/ArticlesPreview";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <UspStrip />
      <CategoryStrip />
      <OccasionBanner />
      <PromoBanners />
      <FeaturedProducts />
      <SaleBanners />
      <GiftKits />
      <UnderPriceBanner />
      <ArticlesPreview />
      <Testimonials />
    </>
  );
}
