"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { createProduct, getCategories, type AdminCategory, type ProductInput } from "@/lib/api";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  const { accessToken } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getCategories(accessToken)
      .then(setCategories)
      .catch(() => undefined);
  }, [accessToken]);

  const handleSubmit = async (input: ProductInput) => {
    if (!accessToken) return;
    const product = await createProduct(accessToken, input);
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New Product</h1>
        <p className="mt-1 text-sm text-muted">Add a new item to the catalog.</p>
      </div>
      {categories && (
        <ProductForm categories={categories} onSubmit={handleSubmit} submitLabel="Create Product" />
      )}
    </div>
  );
}
