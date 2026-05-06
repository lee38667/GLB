'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TabsCtx = { value: string; setValue: (v: string) => void }
const Ctx = createContext<TabsCtx | null>(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
  children: ReactNode
  className?: string
}) {
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal
  const setValue = (v: string) => {
    onValueChange?.(v)
    if (value === undefined) setInternal(v)
  }
  return (
    <Ctx.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  )
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('TabsTrigger must be inside <Tabs>')
  const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-full px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.28em] transition',
        active ? 'bg-ivory text-ink' : 'text-clay hover:text-sand',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('TabsContent must be inside <Tabs>')
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
