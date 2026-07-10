# GLB Admin — Architecture Redesign

_Last updated: 2026-07-10_

## 1. Goals & Requirements

**Functional**
- One coherent admin ("Command Center") covering commerce, community, and marketing.
- Social media analytics: follower growth, reach, engagement per platform, in one place.
- Finance view: revenue, AOV, refunds, breakdowns by product/collection, over time.
- Customers view: who buys, how often, lifetime value — derived from orders (no separate CRM).
- Keep existing working tools (Products CRUD, Events, RSVPs, Email) intact.

**Non-functional**
- Small team (1 operator), low traffic — favor simplicity over scale.
- No new heavy dependencies (charts are hand-rolled SVG; no chart lib).
- Everything must degrade gracefully when an integration isn't connected.

**Constraints**
- Next.js 16 App Router, MongoDB/Mongoose, Paystack, Cloudinary, PostHog (client).
- Social APIs require app credentials + OAuth tokens the operator must provision.

## 2. Information Architecture

```
/admin                 Overview   — cross-domain KPI dashboard
/admin/orders          Commerce   — order list, status transitions
/admin/products        Commerce   — existing CRUD (kept)
/admin/customers       Customers  — aggregated buyer profiles from orders
/admin/finance         Finance    — revenue analytics from orders
/admin/socials         Marketing  — social account connections + analytics
/admin/events          Community  — existing (kept)
/admin/rsvp            Community  — existing (kept)
/admin/email           Community  — existing (kept)
```

Dead nav links removed: `/admin/inventory` (stock lives in the product variant
matrix), `/admin/analytics` (superseded by Overview + Finance + Socials).

## 3. High-Level Design

```
                ┌────────────────────────────────────────────┐
                │  Admin UI (App Router pages, AdminShell)   │
                └───────┬───────────────┬────────────────────┘
                        │ fetch         │ fetch
              ┌─────────▼─────┐  ┌──────▼──────────┐
              │ /api/admin/    │  │ /api/admin/     │
              │ metrics/*      │  │ socials/*       │
              └─────────┬─────┘  └──────┬──────────┘
                        │               │
              ┌─────────▼─────┐  ┌──────▼──────────┐        ┌─────────────┐
              │ server/metrics │  │ server/socials  │───────▶│ Platform    │
              │ (Mongo aggreg.)│  │ (adapters)      │  HTTPS │ Graph APIs  │
              └─────────┬─────┘  └──────┬──────────┘        └─────────────┘
                        │               │
                   ┌────▼───────────────▼────┐
                   │        MongoDB          │
                   │ orders products events  │
                   │ rsvps socialaccounts    │
                   │ socialsnapshots         │
                   └─────────────────────────┘
```

### Metrics layer (`src/server/metrics.ts`)
Pure MongoDB aggregation over existing collections — no new writes, no ETL.
- `getOverviewMetrics()` — revenue (paid+), order counts by status, AOV,
  units sold, low-stock variants, events/RSVP counts.
- `getRevenueSeries(days)` — daily revenue + order count buckets.
- `getFinanceBreakdown()` — revenue by collection and by product, refund totals.
- `getCustomers()` — group orders by `guestEmail`/`userId`: order count, LTV,
  first/last order, top collection. Revenue metrics count `paid` and later
  statuses (`paid`, `fulfilled`, `shipped`, `delivered`); `refunded` tracked
  separately; `pending`/`cancelled` excluded.

### Social integrations (`src/server/socials/`)
**Adapter pattern.** Each platform implements:

```ts
interface SocialAdapter {
  platform: 'instagram' | 'facebook' | 'tiktok'
  fetchMetrics(account: SocialAccountDoc): Promise<SocialMetrics>
}
type SocialMetrics = {
  followers: number; following?: number; posts?: number
  reach28d?: number; impressions28d?: number; profileViews28d?: number
  engagement28d?: number   // likes+comments+shares over trailing window
}
```

- **SocialAccount** collection: `platform`, `handle`, `externalId`,
  `accessToken` (long-lived), `tokenExpiresAt`, `status`
  (`connected|error|disconnected`), `lastSyncedAt`, `lastError`,
  `latest: SocialMetrics`.
- **SocialSnapshot** collection: `{accountId, capturedAt, metrics}` — one doc
  per sync, powers growth charts. Synced on demand ("Sync now") and lazily on
  page load when stale (>6h).
- Tokens are entered by the operator in the Socials page (paste token flow),
  not via full OAuth dance — appropriate for a single-operator tool. The
  adapter validates the token by fetching metrics immediately on connect.

**Provider notes**
- Instagram: Meta Graph API — needs an IG Business/Creator account linked to a
  FB Page; token from Meta developer app (long-lived user token or system
  token). Endpoints: `GET /{ig-user-id}?fields=followers_count,media_count`,
  `GET /{ig-user-id}/insights?metric=reach,profile_views&period=days_28`.
- Facebook Page: `GET /{page-id}?fields=fan_count`, page insights.
- TikTok: TikTok for Developers "Display API" — `user/info/` for
  follower/likes counts. Business API for richer insights.
- X/Twitter intentionally out of v1 (API pricing hostile to small brands).

### Auth
All new `/api/admin/*` routes go through `isAuthorizedAdmin()` (header key
`x-admin-key`, open in dev when `ADMIN_API_KEY` unset). Production hardening
(Auth.js role-gated sessions, encrypted token storage — e.g. AES-GCM with a
`SOCIAL_TOKEN_KEY` env secret) is Phase 4, unchanged from the existing plan.
**Do not deploy the admin publicly without setting `ADMIN_API_KEY`.**

## 4. Trade-offs

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Customer data | Derive from orders at read time | Separate Customer collection kept in sync | No sync bugs; order volume is small; can materialize later |
| Social auth | Paste long-lived token | Full OAuth redirect flow | One operator; OAuth apps still needed either way; 10x less code |
| Charts | Hand-rolled SVG | recharts/chart.js | Zero deps, matches bespoke admin styling |
| Social history | Snapshot per sync | Backfill via platform APIs | Platforms barely expose history; snapshots are simple and honest |
| Finance source | Orders collection | Paystack API reconciliation | Orders already carry paid totals; Paystack recon is Phase 3 |

## 5. Phases

- **P1 (this change)**: metrics layer, Overview rebuild, Finance, Customers,
  Orders page, Socials framework + UI, nav cleanup.
- **P2**: PostHog server API (site traffic/conversion funnels in Overview),
  CSV exports on Finance/Customers.
- **P3**: Paystack settlement reconciliation (fees, payouts), inventory
  alerts→email.
- **P4**: Auth.js session auth for admin, encrypted token storage, audit log.

## 6. Revisit when…
- Order volume > ~5k/month → materialize customer profiles, cache metrics.
- More operators → real OAuth, roles, audit trail.
- More platforms → move sync to a scheduled job (cron) instead of on-demand.
