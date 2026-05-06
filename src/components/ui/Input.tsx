'use client'

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/cn'

const fieldBase =
  'w-full border border-ink bg-paper-warm px-4 py-3 text-sm text-ink placeholder:text-graphite/70 placeholder:italic font-sans transition focus:border-vermillion focus:outline-none focus:ring-1 focus:ring-vermillion/40 disabled:opacity-60'

type FieldShellProps = {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  id?: string
  children: (id: string) => React.ReactNode
}

function FieldShell({ label, hint, error, required, id, children }: FieldShellProps) {
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
      {children(fieldId)}
      {hint && !error && <p className="font-mono text-[0.66rem] text-graphite tracking-wide">{hint}</p>}
      {error && (
        <p role="alert" className="font-mono text-[0.66rem] text-vermillion tracking-wide">
          {error}
        </p>
      )}
    </div>
  )
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, id, className, containerClassName, ...rest },
  ref,
) {
  return (
    <div className={containerClassName}>
      <FieldShell label={label} hint={hint} error={error} required={required} id={id}>
        {(fieldId) => (
          <input
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={!!error || undefined}
            className={cn(fieldBase, error && 'border-vermillion focus:border-vermillion', className)}
            {...rest}
          />
        )}
      </FieldShell>
    </div>
  )
})

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, id, className, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} id={id}>
      {(fieldId) => (
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={!!error || undefined}
          className={cn(
            fieldBase,
            'min-h-[120px] resize-y',
            error && 'border-vermillion focus:border-vermillion',
            className,
          )}
          {...rest}
        />
      )}
    </FieldShell>
  )
})
