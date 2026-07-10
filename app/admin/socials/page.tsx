'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminShell } from '@/components/admin/AdminShell'
import { Sparkline, StatTile } from '@/components/admin/metrics-ui'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { adminHeaders } from '@/lib/admin-client'
import type { PublicSocialAccount } from '@/server/socials'

const nf = new Intl.NumberFormat('en-NA')

export default function AdminSocialsPage() {
  const [accounts, setAccounts] = useState<PublicSocialAccount[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = async (sync = false) => {
    try {
      const res = await fetch(`/api/admin/socials${sync ? '?sync=1' : ''}`, {
        headers: adminHeaders(),
      })
      if (!res.ok) throw new Error('load failed')
      const json = await res.json()
      setAccounts(json.data)
    } catch {
      setError('Unable to load social accounts.')
    }
  }

  useEffect(() => {
    load(true) // lazily refreshes accounts stale by >6h
  }, [])

  const act = async (platform: string, action: 'sync' | 'disconnect') => {
    if (action === 'disconnect' && !confirm(`Disconnect ${platform}? Metrics history is kept.`)) return
    setBusy(platform)
    try {
      const res = await fetch('/api/admin/socials', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ platform, action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Action failed')
      toast.success(action === 'sync' ? `${platform} synced` : `${platform} disconnected`)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  const followerTotal = (accounts ?? [])
    .filter((a) => a.connected && a.latest)
    .reduce((sum, a) => sum + (a.latest?.followers ?? 0), 0)
  const connectedCount = (accounts ?? []).filter((a) => a.connected).length

  return (
    <AdminShell
      title="Socials"
      description="Every platform in one letterbox. Connect an account once; metrics refresh on load (6h cadence) or on demand."
    >
      {error && (
        <div className="mb-8 border border-vermillion bg-paper-warm p-4 text-sm text-vermillion">{error}</div>
      )}

      {!accounts && !error && (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {accounts && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatTile
              label="Combined following"
              value={nf.format(followerTotal)}
              sublabel="Across connected platforms"
              accent
            />
            <StatTile label="Platforms connected" value={`${connectedCount} / ${accounts.length}`} />
            <StatTile
              label="Last sync"
              value={
                accounts
                  .filter((a) => a.lastSyncedAt)
                  .map((a) => a.lastSyncedAt!)
                  .sort()
                  .at(-1)
                  ?.slice(0, 16)
                  .replace('T', ' ') ?? '—'
              }
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            {accounts.map((a) => (
              <PlatformCard
                key={a.platform}
                account={a}
                busy={busy === a.platform}
                onSync={() => act(a.platform, 'sync')}
                onDisconnect={() => act(a.platform, 'disconnect')}
                onConnected={load}
              />
            ))}
          </section>
        </>
      )}
    </AdminShell>
  )
}

function PlatformCard({
  account,
  busy,
  onSync,
  onDisconnect,
  onConnected,
}: {
  account: PublicSocialAccount
  busy: boolean
  onSync: () => void
  onDisconnect: () => void
  onConnected: () => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [handle, setHandle] = useState(account.handle ?? '')
  const [externalId, setExternalId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [connecting, setConnecting] = useState(false)

  const connect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/admin/socials', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          platform: account.platform,
          handle,
          externalId: externalId || handle,
          accessToken,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Connection failed')
      toast.success(`${account.label} connected`)
      setShowForm(false)
      setAccessToken('')
      await onConnected()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  const m = account.latest

  return (
    <article className="flex flex-col border border-ink bg-paper-warm p-5">
      <header className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide">{account.label}</h3>
          {account.handle && <p className="font-mono text-xs text-graphite">@{account.handle}</p>}
        </div>
        <span
          className={`border px-2 py-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] ${
            account.status === 'connected'
              ? 'border-ink'
              : account.status === 'error'
                ? 'border-vermillion text-vermillion'
                : 'border-hairline text-graphite'
          }`}
        >
          {account.status}
        </span>
      </header>

      {account.connected && m ? (
        <div className="mt-4 flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Followers" value={m.followers ?? 0} />
            {m.posts != null && <Metric label="Posts" value={m.posts} />}
            {m.reach28d != null && <Metric label="Reach · 28d" value={m.reach28d} />}
            {m.profileViews28d != null && <Metric label="Profile views · 28d" value={m.profileViews28d} />}
            {m.engagement28d != null && <Metric label="Total likes" value={m.engagement28d} />}
          </div>

          <div>
            <p className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-graphite">
              Follower trend
            </p>
            <Sparkline values={account.history.map((h) => h.followers)} />
          </div>

          {account.lastError && (
            <p className="text-xs text-vermillion">Last sync error: {account.lastError}</p>
          )}

          <div className="mt-auto flex gap-2 pt-2">
            <button
              onClick={onSync}
              disabled={busy}
              className="flex-1 border border-ink px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              {busy ? 'Syncing…' : 'Sync now'}
            </button>
            <button
              onClick={onDisconnect}
              disabled={busy}
              className="border border-hairline px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-graphite transition hover:border-vermillion hover:text-vermillion disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          {!showForm ? (
            <>
              <p className="text-sm text-graphite">Not connected yet.</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[0.76rem] leading-relaxed text-sepia">
                {account.connectHelp.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <button
                onClick={() => setShowForm(true)}
                className="mt-auto border border-ink px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition hover:bg-ink hover:text-paper"
              >
                Connect {account.label}
              </button>
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-3">
              <Input label="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="giveloveback" />
              <Input
                label={account.externalIdLabel}
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
              />
              <Input
                label="Access token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste long-lived token"
              />
              <div className="mt-auto flex gap-2 pt-1">
                <button
                  onClick={connect}
                  disabled={connecting || !handle || !accessToken}
                  className="flex-1 border border-ink bg-ink px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper transition hover:bg-vermillion disabled:opacity-50"
                >
                  {connecting ? 'Validating…' : 'Connect'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-hairline px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-graphite"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-2xl tabular-nums">{nf.format(value)}</div>
      <div className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-graphite">{label}</div>
    </div>
  )
}
