'use client'

import { forwardRef, type SelectHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/cn'

export type SelectOption = { value: string; label: string; disabled?: boolean }

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, required, id, className, ...rest },
  ref,
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={fieldId}
          className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.22em] text-graphite"
        >
          {label}
          {required && <span className="ml-1 text-vermillion">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error || undefined}
          className={cn(
            'w-full appearance-none border border-ink bg-paper-warm px-4 py-3 pr-10 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-ink transition focus:border-vermillion focus:outline-none focus:ring-1 focus:ring-vermillion/40 disabled:opacity-60',
            error && 'border-vermillion focus:border-vermillion',
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-vermillion"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {hint && !error && <p className="font-mono text-[0.66rem] text-graphite tracking-wide">{hint}</p>}
      {error && (
        <p role="alert" className="font-mono text-[0.66rem] text-vermillion tracking-wide">
          {error}
        </p>
      )}
    </div>
  )
})
