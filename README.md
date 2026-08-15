# Juhaina Editorial

Production repository for a personal editorial website spanning Films,
Moodboards, Projections, and Lists.

The repository was initialized on 2026-08-01. The dimensional portal homepage,
Film Thoughts index and article template, and the first central administration
workflow are implemented in Next.js. The remaining editorial surfaces are sequenced in
[`docs/initial-product-plan.md`](docs/initial-product-plan.md). Architecture
decisions and approval gates are tracked in
[`docs/decision-log.md`](docs/decision-log.md).

The supplied visual references remain in the adjacent
`/Users/AndreVice/Desktop/Juhaina References` directory and are the visual
source of truth until a direction is explicitly approved.

## Local development

```bash
npm install
npm run dev
```

The homepage is available at `/`, Film Thoughts at `/films`, and the central
author workspace at `/admin`. When Supabase environment variables are absent,
development uses a fail-safe local preview mode: drafts and uploaded preview
images are kept in the current browser, but publishing is disabled. Production
never enables that local bypass.

See [`docs/admin-backend-setup.md`](docs/admin-backend-setup.md) to connect the
single-author login, database, and private image storage.

Add `?type-lab=1` to the homepage URL to compare the approved local type
options. Syne Mono is the clean default; Syne Tactile is available in the type
lab. NCL Bhagnes Kirefoda remains disabled until a commercial webfont license
and licensed font file are supplied. The Desktop file currently available is a
personal-use-only demo and must not be shipped for this client project.

## Quality checks

```bash
npm run typecheck
npm run build
```
