'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function RsvpModal({ isOpen, onClose, event }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
      setSubmitStatus(null)
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventTitle: event.title,
          eventDate: event.date,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({ type: 'success', message: 'RSVP submitted successfully! We\'ll be in touch soon.' })
        setFormData({ name: '', email: '', phone: '', guests: 1, message: '' })
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to submit RSVP. Please try again.' })
      }
    } catch (error) {
      console.error('RSVP error:', error)
      setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!event) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />

          <div className="relative z-10 flex min-h-full items-center justify-center">
            <motion.div
              className="w-full max-w-2xl overflow-hidden border border-ink bg-paper-warm relative"
              style={{ boxShadow: '10px 10px 0 0 var(--vermillion)' }}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-ink pb-5">
                  <div>
                    <p className="font-mono text-vermillion text-[0.62rem] tracking-[0.22em] uppercase">
                      № — RSVP
                    </p>
                    <h2
                      id="rsvp-modal-title"
                      className="glb-display mt-2 text-[clamp(1.6rem,3vw,2.4rem)]"
                    >
                      {event.title}<span className="text-vermillion">.</span>
                    </h2>
                    <p className="mt-3 font-mono text-xs tracking-[0.05em] text-graphite">
                      {event.date}
                      {event.time ? <> · {event.time}</> : null}
                      {event.location ? <> · {event.location}</> : null}
                      {event.entrance ? <> · Entry {event.entrance}</> : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="self-end border border-ink px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-paper"
                    aria-label="Close modal"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                      Name <span className="text-vermillion">*</span>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="brand-input font-display text-lg italic normal-case tracking-normal text-ink"
                      />
                    </label>

                    <label className="flex flex-col gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                      Email <span className="text-vermillion">*</span>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@somewhere.world"
                        className="brand-input font-display text-lg italic normal-case tracking-normal text-ink"
                      />
                    </label>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                      Phone
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+264 …"
                        className="brand-input font-display text-lg italic normal-case tracking-normal text-ink"
                      />
                    </label>

                    <label className="flex flex-col gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                      Tickets
                      <input
                        type="number"
                        name="guests"
                        min="1"
                        max="10"
                        value={formData.guests}
                        onChange={handleChange}
                        className="brand-input font-display text-lg italic normal-case tracking-normal text-ink"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-graphite">
                    A note
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any requests or questions? (optional)"
                      className="brand-textarea font-display text-lg italic normal-case tracking-normal text-ink"
                    />
                  </label>

                  {submitStatus && (
                    <div
                      className={`border px-5 py-3 font-mono text-[0.7rem] tracking-wide ${
                        submitStatus.type === 'success'
                          ? 'border-ink bg-paper text-ink'
                          : 'border-vermillion bg-paper text-vermillion'
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-4 border-t border-ink pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="glb-btn glb-btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="glb-btn glb-btn-ink disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sealing…' : 'Seal & send RSVP'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
