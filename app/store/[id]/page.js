"use client";

import Image from "next/image";
import Link from "next/link";

import { PRODUCTS } from "../../../src/data/products";
import { formatPrice } from "../../../src/lib/pricing";
import { useCart } from "../../../src/state/CartContext";

export default function ProductDetails({ params }) {
    const { id } = params;
    const product = PRODUCTS.find((item) => item.id === id);
    const { add } = useCart();

    if (!product) {
        return (
            <main className="brand-section pt-36">
                <div className="brand-shell text-center">
                    <h1 className="font-display text-5xl uppercase text-white">Product Not Found</h1>
                    <p className="mt-4 text-zinc-300">This drop may have moved or sold out.</p>
                    <Link href="/store" className="brand-button brand-button-primary mt-7">
                        Back To Store
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="brand-section pt-32 sm:pt-36">
            <div className="brand-shell">
                <div className="brand-grid items-start">
                    <article className="brand-media-card span-7 rounded-3xl">
                        <div className="relative h-[580px]">
                            <Image
                                src={`/assets/${product.file}`}
                                alt={product.name}
                                fill
                                sizes="(min-width: 1024px) 58vw, 100vw"
                                className="object-cover"
                                priority
                            />
                        </div>
                    </article>

                    <aside className="brand-panel span-5 rounded-3xl p-7 sm:p-8">
                        <p className="brand-chip">{product.collection}</p>
                        <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] text-white">{product.name}</h1>
                        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-300">{formatPrice(product.price)} • Tax Included</p>
                        <p className="mt-6 text-sm leading-relaxed text-zinc-300">
                            {product.description} Engineered for daily movement with a statement silhouette and premium comfort.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => add(product.id)}
                                className="brand-button brand-button-primary"
                            >
                                Add To Cart
                            </button>
                            <Link href="/store" className="brand-button brand-button-ghost">
                                Back To Collection
                            </Link>
                        </div>

                        {Array.isArray(product.specs) && product.specs.length > 0 && (
                            <section className="mt-8">
                                <p className="brand-eyebrow">Specs</p>
                                <dl className="mt-4 space-y-2">
                                    {product.specs.map((spec) => (
                                        <div key={spec.label} className="flex items-start justify-between gap-3 border-b border-white/10 py-2 text-sm text-zinc-300">
                                            <dt className="uppercase tracking-[0.2em] text-zinc-500">{spec.label}</dt>
                                            <dd className="text-right">{spec.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        <p className="mt-7 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs uppercase tracking-[0.16em] text-zinc-300">
                            Ships in 2-4 business days. Free exchange window: 30 days.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    );
}
