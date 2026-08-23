export type Category = {
  slug: string;
  name: string;
  image: string;
  count: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  image2?: string;
  rating: number;
  reviews: number;
  category: string;
  badge?: "sale" | "new" | "hot";
  description: string;
  sku: string;
  inStock: boolean;
  gallery: string[];
  returnDays?: number | null;
  deliveryEstimateDays?: number | null;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  comments: number;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatar: string;
};
