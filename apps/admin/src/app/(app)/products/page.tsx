"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { deleteProduct, getProducts, type AdminProductSummary, type Paginated } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function ProductsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("products.write");
  const [result, setResult] = useState<Paginated<AdminProductSummary> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    if (!accessToken) return;
    getProducts(accessToken, { search: search || undefined, page })
      .then(setResult)
      .catch(() => undefined);
  };

  // search is intentionally excluded — it only takes effect on submit (handleSearch),
  // not on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [accessToken, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (product: AdminProductSummary) => {
    if (!accessToken) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(accessToken, product.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this product.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted">{result?.meta.total ?? 0} products in the catalog.</p>
        </div>
        {canWrite && (
          <Link
            href="/products/new"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Product
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result?.data.map((product) => (
              <tr key={product.id}>
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {product.image && (
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted">{product.sku}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{product.categoryName}</td>
                <td className="px-5 py-3">
                  {product.salePrice ? (
                    <span className="flex flex-col">
                      <span className="font-medium text-primary">{formatMoney(product.salePrice)}</span>
                      <span className="text-xs text-muted line-through">{formatMoney(product.price)}</span>
                    </span>
                  ) : (
                    <span className="text-ink">{formatMoney(product.price)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={product.stockQty === 0 ? "font-medium text-primary" : "text-ink"}>
                    {product.stockQty}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {canWrite && (
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        aria-label="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.data.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No products match your search.</p>
        )}
      </div>

      {result && result.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-line px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted">
            Page {result.meta.page} of {result.meta.totalPages}
          </span>
          <button
            disabled={page >= result.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-line px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
