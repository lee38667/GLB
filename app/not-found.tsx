import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-display text-[8rem] leading-none text-sand">404</p>
      <h1 className="text-[0.65rem] uppercase tracking-[0.32em] text-clay">Page not found</h1>
      <p className="max-w-md text-sm leading-relaxed text-clay">
        The page you&apos;re looking for has moved, been renamed, or never existed.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="primary">
          Browse Shop
        </Button>
        <Button href="/" variant="secondary">
          Home
        </Button>
      </div>
    </div>
  )
}
