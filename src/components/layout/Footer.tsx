import Link from 'next/link'
import { SITE } from '@/lib/constants'

const sections = [
  {
    title: 'Catalogue',
    links: [
      { href: '/shop', label: 'All pieces' },
      { href: '/shop?filter=new', label: 'New letters' },
      { href: '/shop?filter=sale', label: 'Final stamps' },
    ],
  },
  {
    title: 'House',
    links: [
      { href: '/about', label: 'Our story' },
      { href: '/events', label: 'Gatherings' },
      { href: '/gallery', label: 'Archive' },
      { href: '/contact', label: 'Write to us' },
    ],
  },
  {
    title: 'Service',
    links: [
      { href: '/shipping', label: 'Shipping' },
      { href: '/returns', label: 'Returns' },
      { href: '/size-guide', label: 'Sizing' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Fine print',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper-warm relative">
      {/* perforated top edge */}
      <div
        aria-hidden
        className="absolute -top-[3px] left-0 right-0 h-[6px]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #F2EBDD 3px, transparent 3.6px)',
          backgroundSize: '6px 6px',
          backgroundRepeat: 'repeat-x',
        }}
      />

      <div className="glb-shell py-20">
        {/* Big script wordmark */}
        <div className="border-b border-paper-warm/20 pb-10">
          <p className="font-mono text-[0.66rem] tracking-[0.22em] uppercase text-vermillion">
            № 99 — Closing letter
          </p>
          <h2 className="font-display italic font-light text-[clamp(3rem,10vw,8rem)] leading-[0.85] tracking-tight mt-4">
            {SITE?.shortName ?? 'Give Love Back'}
            <span className="text-vermillion">.</span>
          </h2>
          <p className="font-display text-xl mt-5 max-w-xl text-paper-warm/80">
            {SITE?.description ?? 'A community-first clothing house from Namibia. Wear your truth — pass it on.'}
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Newsletter / address */}
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-paper-warm/55">
              Atelier
            </p>
            <p className="mt-3 font-display text-2xl tracking-tight">
              Windhoek · <em className="italic text-vermillion">Namibia</em>
            </p>
            <p className="mt-2 text-sm text-paper-warm/70 leading-relaxed max-w-xs">
              Visits by appointment. Letters always welcome.
            </p>

            <form
              action="/api/newsletter"
              method="post"
              className="mt-8 max-w-sm border-b border-paper-warm/40 pb-2 flex items-center gap-3"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Address an envelope to us"
                aria-label="Email address"
                className="flex-1 bg-transparent py-3 text-base font-display italic text-paper-warm placeholder:text-paper-warm/35 focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion hover:text-paper-warm transition-colors"
              >
                Send →
              </button>
            </form>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {sections.map((s, i) => (
              <div key={s.title}>
                <h4 className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.22em] text-vermillion">
                  {String(i + 1).padStart(2, '0')} · {s.title}
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-paper-warm/80 transition hover:text-paper-warm hover:italic"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-paper-warm/15 pt-8 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-paper-warm/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SITE?.name ?? 'Give Love Back'} · All love reserved</p>
          <p>Set in Fraunces &amp; Geist · Hand-stamped in Windhoek</p>
        </div>
      </div>
    </footer>
  )
}
