
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";

import { fetchProducts } from "../services/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    try {
      const data = await fetchProducts();

      if (!Array.isArray(data)) {
        throw new Error("The Product Service returned an unexpected response.");
      }

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) =>
      String(product.name ?? "").toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const formatPrice = (price) => {
    const amount = Number(price);

    if (price == null || price === "" || !Number.isFinite(amount)) {
      return "—";
    }

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Resource management
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            Products
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Live data from your Product Service.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadProducts()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Total products loaded
            </p>

            <Package size={19} className="text-zinc-400" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {products.length.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
          <p className="text-sm text-zinc-400">
            Matching products
          </p>

          <p className="mt-3 text-3xl font-semibold text-white">
            {filteredProducts.length.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <label className="flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:border-white/25">
            <Search size={17} className="shrink-0 text-zinc-500" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products by name..."
              aria-label="Search products by name"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">
                Could not load products
              </p>

              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={() => loadProducts()}
                disabled={loading}
                className="mt-3 underline underline-offset-4 disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            Loading products...
          </div>
        ) : !error ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product.id ?? `${product.name}-${index}`}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 font-medium text-zinc-200">
                      {product.name ?? "Unnamed product"}
                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {product.id ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-200">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {product.stock ?? "—"}
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-zinc-500"
                    >
                      {products.length === 0
                        ? "No products available."
                        : "No products match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
