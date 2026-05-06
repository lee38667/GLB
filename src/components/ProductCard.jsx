import Image from 'next/image'
import Link from 'next/link'

import { formatPrice } from '../lib/pricing'
import { useCart } from '../state/CartContext'

export default function ProductCard({ p, className = '' }) {
  const { add } = useCart()

  return (
    <article className={`group relative flex flex-col overflow-hidden border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${className}`}>
      <Link href={`/store/${p.id}`} className="relative h-[270px] overflow-hidden bg-white/5">
        <Image
          src={`/assets/${p.file}`}
          alt={p.name}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 768px) 45vw, 90vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-black/10 bg-white/95 px-3 py-1 text-[0.58rem] uppercase tracking-[0.28em] text-black">
          {p.collection}
        </span>
        <span className="absolute right-4 top-4 rounded-full border border-black/10 bg-white/95 px-3 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-black">
          {formatPrice(p.price)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header>
          <h3 className="font-display text-lg uppercase leading-tight text-black">{p.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{p.description}</p>
        </header>

        <footer className="mt-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => add(p.id)}
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-black px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-zinc-800"
          >
            Add
          </button>
          <Link
            href={`/store/${p.id}`}
            className="inline-flex items-center justify-center rounded-full border border-black/15 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-black transition hover:border-black/40"
          >
            Details
          </Link>
        </footer>
      </div>
    </article>
  )
}
