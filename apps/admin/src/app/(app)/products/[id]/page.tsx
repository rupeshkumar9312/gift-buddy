"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getCategories,
  getProduct,
  updateProduct,
  type AdminCategory,
  type AdminProductDetail,
  type ProductInput,
} from "@/lib/api";
import { ProductForm } from "@/components/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const { accessToken } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([getCategories(accessToken), getProduct(accessToken, productId)])
      .then(([cats, prod]) => {
        setCategories(cats);
        setProduct(prod);
      })
      .catch(() => setNotFound(true));
  }, [accessToken, productId]);

  const handleSubmit = async (input: ProductInput) => {
    if (!accessToken) return;
    const updated = await updateProduct(accessToken, productId, input);
    setProduct(updated);
    router.push("/products");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <p className="mt-1 text-sm text-muted">{product?.name}</p>
      </div>
      {notFound && <p className="text-sm text-muted">That product couldn&rsquo;t be found.</p>}
      {categories && product && (
        <ProductForm
          categories={categories}
          initial={product}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
}
