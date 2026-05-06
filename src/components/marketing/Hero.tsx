'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const introStats = [
  {
    label: 'Mission',
    value: 'Give Love Back',
    text: 'Fashion that carries care, connection, and self-expression.',
  },
  {
    label: 'Vision',
    value: 'Grow Together',
    text: 'We create spaces where other brands and voices can shine.',
  },
  {
    label: 'Story',
    value: 'Four Friends, One Vision',
    text: 'Designing together to make a difference — one garment at a time.',
  },
] as const

const ease = [0.17, 0.67, 0.36, 0.99] as const

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const orbScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.1])
  const orbOpacity = useTransform(scrollYProgress, [0, 1], [0.25, 0.55])

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden px-6 pb-28 pt-32 sm:px-10 sm:pt-36 lg:pt-40"
    >
      <motion.span
        style={{ scale: orbScale, opacity: orbOpacity }}
        className="pointer-events-none absolute -top-32 left-1/2 h-[440px] w-[180px] -translate-x-1/2 rounded-full bg-hero-gradient blur-3xl"
      />

      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="pointer-events-none absolute -right-24 top-10 hidden lg:block">
          <motion.div
            style={{ y: parallaxY, x: '18%' }}
            className="relative h-[440px] w-[720px] overflow-hidden rounded-[36px] border border-white/10 bg-black/20 shadow-xl"
          >
            <Image
              src="/assets/hero.jpg"
              alt=""
              fill
              priority
              sizes="720px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60" />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.span
          className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-clay backdrop-blur sm:text-xs sm:tracking-[0.38em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
        >
          Movement · Give Love Back
        </motion.span>

        <motion.h1
          className="mt-8 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-sand sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease }}
        >
          Fashion as an act of care.
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-base leading-relaxed text-clay/80 md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.65, ease: 'easeOut' }}
        >
          GLB is a community-first label founded by four friends — creating pieces that carry love into every space and make room for others to shine.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: 'easeOut' }}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 rounded-full bg-ivory px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-ink shadow-[0_18px_32px_rgba(255,255,255,0.18)] transition hover:shadow-[0_22px_40px_rgba(255,255,255,0.26)]"
          >
            Explore Collections
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-7 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-sand transition hover:bg-white/20"
          >
            Our Story
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16 } },
          }}
        >
          {introStats.map((item) => (
            <motion.article
              key={item.label}
              variants={{
                hidden: { y: 60, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-sm tracking-wide text-clay/80 backdrop-blur transition hover:border-white/40 hover:bg-white/10"
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-flare/80">
                {item.label}
              </span>
              <h3 className="mt-3 font-display text-2xl text-sand">{item.value}</h3>
              <p className="mt-3 text-xs leading-relaxed text-clay/80">{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
