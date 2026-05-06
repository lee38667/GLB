"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import Logo from "../../src/components/Logo";
import ProductCard from "../../src/components/ProductCard";
import { PRODUCTS } from "../../src/data/products";
import { formatPrice } from "../../src/lib/pricing";

const TAB_SECTIONS = {
    "Best Seller": PRODUCTS,
    "New Arrivals": [...PRODUCTS].slice(2).concat(PRODUCTS.slice(0, 2)),
    "Most Popular": [...PRODUCTS].slice(1).concat(PRODUCTS.slice(0, 1)),
};

const COLLECTION_FILTERS = ["All", "GLB Classic", "Embrace It", "Accessories", "Exclusives", "Winter Lore"];

export default function StorePage() {
    const [activeShelf, setActiveShelf] = useState("Best Seller");
    const [activeCollection, setActiveCollection] = useState("All");

    const heroProduct = useMemo(() => {
        const shelfProducts = TAB_SECTIONS[activeShelf] || PRODUCTS;
        return shelfProducts[0] || PRODUCTS[0];
    }, [activeShelf]);

    const shelfProducts = useMemo(() => {
        const source = TAB_SECTIONS[activeShelf] || PRODUCTS;
        if (activeCollection === "All") return source;
        return source.filter((product) => product.collection === activeCollection);
    }, [activeShelf, activeCollection]);

    const collectionCount = useMemo(
        () => new Set(PRODUCTS.map((product) => product.collection)).size,
        [],
    );

    const stats = [
        { label: "Live Pieces", value: String(PRODUCTS.length) },
        { label: "Collections", value: String(collectionCount) },
        { label: "Drop Mode", value: "Limited" },
    ];

    return (
        <main className="bg-ink text-sand">
            <section className="brand-shell relative pt-6 sm:pt-8">
                <header className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div className="flex items-center gap-4">
                        <Logo size={24} isLight showWordmark />
                        <span className="hidden text-[0.62rem] uppercase tracking-[0.24em] text-zinc-400 lg:inline-block">
                            Royal streetwear shop
                        </span>
                    </div>

                    <nav className="hidden items-center gap-7 md:flex">
                        {[
                            ["Shop", "#shop"],
                            ["Collection", "#collection"],
                            ["Lookbook", "#lookbook"],
                            ["Contact", "/contact"],
                        ].map(([label, href]) => (
                            <Link key={label} href={href} className="text-[0.66rem] uppercase tracking-[0.22em] text-zinc-400 transition hover:text-white">
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-zinc-400">
                        <span className="hidden sm:inline">New arrival</span>
                        <span className="h-2 w-2 rounded-full bg-white" />
                    </div>
                </header>
            </section>

            <section className="brand-shell relative overflow-hidden pt-10 sm:pt-12" id="shop">
                <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                    <div className="max-w-xl">
                        <p className="brand-eyebrow text-zinc-400">Next Arrival</p>
                        <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-[0.02em] text-sand sm:text-6xl lg:text-[5.5rem]">
                            {heroProduct.name}
                        </h1>
                        <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
                            {heroProduct.description} Built with a clean silhouette, elevated contrast, and the confidence of a modern street uniform.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href={`/store/${heroProduct.id}`} className="brand-button brand-button-primary">
                                Discover More
                            </Link>
                            <Link href="/assets/glb-catalog.pdf" target="_blank" rel="noopener noreferrer" className="brand-button brand-button-ghost border-white/15 text-sand">
                                View Catalog
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-3 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div key={stat.label} className="border-t border-black/10 pt-4">
                                    <p className="text-[0.6rem] uppercase tracking-[0.28em] text-zinc-500">{stat.label}</p>
                                    <p className="mt-2 font-display text-2xl uppercase text-sand">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 mx-auto h-[340px] w-[340px] rounded-full bg-white/10 sm:h-[440px] sm:w-[440px]" />
                        <div className="relative z-10 w-full max-w-[560px]">
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <Image
                                    src={`/assets/${heroProduct.file}`}
                                    alt={heroProduct.name}
                                    fill
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                    className="object-contain p-6"
                                    priority
                                />
                            </div>
                        </div>

                        <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col gap-7 text-right lg:flex">
                            <div>
                                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-400">Special Price</p>
                                <p className="mt-1 font-display text-3xl uppercase text-sand">
                                    {heroProduct.price ? formatPrice(heroProduct.price) : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-zinc-400">New Arrival</p>
                                <p className="mt-1 font-display text-2xl uppercase text-sand">Royal Street</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="brand-shell mt-12" id="collection">
                <div className="flex items-center justify-center gap-8 border-y border-white/10 py-4 text-sm">
                    {Object.keys(TAB_SECTIONS).map((section) => (
                        <button
                            key={section}
                            type="button"
                            onClick={() => setActiveShelf(section)}
                            className={`text-[0.78rem] uppercase tracking-[0.2em] transition ${activeShelf === section ? "text-white" : "text-zinc-500 hover:text-white"}`}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {COLLECTION_FILTERS.map((collection) => {
                        const isActive = activeCollection === collection;
                        return (
                            <button
                                key={collection}
                                type="button"
                                onClick={() => setActiveCollection(collection)}
                                className={`rounded-full border px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition ${isActive
                                    ? "border-white bg-white text-black"
                                    : "border-white/15 bg-transparent text-sand hover:border-white/40"
                                    }`}
                            >
                                {collection}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="brand-shell py-12" id="lookbook">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                    {shelfProducts.map((product) => (
                        <ProductCard key={product.id} p={product} />
                    ))}
                </div>
            </section>

            <section className="brand-shell pb-12">
                <div className="grid gap-6 border-t border-black/10 pt-8 md:grid-cols-[1.1fr_0.9fr_0.8fr]">
                    <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.28em] text-zinc-400">Help & Information</p>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                            <li>Track Order</li>
                            <li>Delivery & Returns</li>
                            <li>FAQs</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.28em] text-zinc-400">About GLB</p>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                            <li>About Us</li>
                            <li>Culture</li>
                            <li>Events</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                        <p className="text-[0.6rem] uppercase tracking-[0.28em] text-zinc-400">Store Notes</p>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-300 md:text-right">
                            Monochrome, limited, and made to move. The new GLB store is tuned for fast discovery and confident buying.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
