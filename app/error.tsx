'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="text-[0.65rem] uppercase tracking-[0.32em] text-clay">Error</p>
      <h1 className="font-display text-4xl uppercase tracking-wide text-sand">
        Something broke.
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-clay">
        We&apos;ve logged this and will take a look. You can try again or head back to the shop.
      </p>
      {error.digest && (
        <p className="font-mono text-[0.65rem] text-tide">ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Home
        </Button>
      </div>
    </div>
  )
}
