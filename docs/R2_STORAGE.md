# Cloudflare R2 Storage & Sync Guide

AniBoop serves **all** mascot WebP assets — 248 × 248 center previews, 504 × 504 compact playback sheets, and 1080 × 1080 master download sheets — from Cloudflare R2 object storage to keep the Git repository lean and avoid Vercel bandwidth overages (\$0 egress).

---

## Architecture & Asset Delivery

AniBoop uses a three-tier delivery pipeline hosted on `https://aniboop-assets.nmrisrl.dev`:

```mermaid
flowchart TD
    User["Visitor / Creator"] --> Request{"Asset Request"}
    Request -->|"Initial grid / catalog (248 × 248)"| Previews["Cloudflare R2<br>(previews/<id>.webp?v=<hash>)"]
    Request -->|"Gaze / boop / 504 Web download"| Compact["Cloudflare R2<br>(gallery-sheets/<id>-*.webp?v=<hash>)"]
    Request -->|"1080 HD master download"| Master["Cloudflare R2<br>(sheets/<id>-*.webp?v=<hash>)"]
```

| Asset Tier          | Resolution  | R2 Prefix                                                        | Delivery Details                                                                                               |
| :------------------ | :---------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Previews**        | 248 × 248   | `aniboop-assets.nmrisrl.dev/previews/<id>.webp?v=<hash>`         | Center-pose stills rendered in the homepage grid, catalog thumbnails, and README featured lineup.              |
| **504 Web Sheets**  | 504 × 504   | `aniboop-assets.nmrisrl.dev/gallery-sheets/<id>-*.webp?v=<hash>` | Compact 3 × 3 playback sheets used for cursor gaze tracking, boop reactions, and lightweight web downloads.    |
| **1080 HD Masters** | 1080 × 1080 | `aniboop-assets.nmrisrl.dev/sheets/<id>-*.webp?v=<hash>`         | Full-resolution master sheets for design, editing, and archiving, downloaded on demand from Character Details. |

Implementation references:

- Asset URL resolution & `?v=<hash>` versioning: [`src/lib/assets.ts`](../src/lib/assets.ts), [`src/data/characters.ts`](../src/data/characters.ts)
- R2 `<link rel="preconnect">` hint: [`src/app/layout.tsx`](../src/app/layout.tsx)
- Download dialog: [`src/components/character/character-details-content.tsx`](../src/components/character/character-details-content.tsx)
- Download handler: [`src/hooks/use-download.ts`](../src/hooks/use-download.ts)

> [!NOTE]
> If `NEXT_PUBLIC_R2_ASSETS_URL` is unset (e.g., offline local development), asset URLs fall back to local `/mascots/{previews,gallery-sheets}/` paths.

---

## Live Cloudflare R2 Configuration

### Bucket Details

- **Bucket Name:** `aniboop-assets`
- **Custom Domain:** `https://aniboop-assets.nmrisrl.dev`
- **Storage Class:** Standard
- **Caching:** Every object is uploaded with `Cache-Control: public, max-age=31536000, immutable`. Set **Caching → Configuration → Browser Cache TTL** to **Respect Existing Headers** on the Cloudflare zone so Cloudflare preserves the 1-year immutable header instead of overriding it to 4 hours. Each character's 8-character content hash (`v` in `src/data/characters.json`) is appended as `?v=<hash>` to bust both CDN and browser caches automatically whenever artwork changes.

> [!IMPORTANT]
> **Subdomain Level Constraint (Universal SSL):**
> Cloudflare's free Universal SSL certificate covers only apex domains (`nmrisrl.dev`) and single-level wildcards (`*.nmrisrl.dev`).
>
> - ✅ Single-level subdomains: `aniboop-assets.nmrisrl.dev` or `assets-aniboop.nmrisrl.dev`.
> - ❌ Multi-level subdomains like `assets.aniboop.nmrisrl.dev` (two dots) trigger SSL certificate mismatch warnings unless covered by Cloudflare's paid Advanced Certificate Manager (\$10/month).

### Bucket Folder Hierarchy

Files in R2 are stored under three top-level prefixes matching [`src/lib/assets.ts`](../src/lib/assets.ts):

```text
aniboop-assets (Bucket root)
├── previews/
│   ├── aizawa.webp
│   └── ... (139 files)
├── gallery-sheets/
│   ├── aizawa-directions.webp
│   ├── aizawa-reactions.webp
│   └── ... (278 files)
└── sheets/
    ├── aizawa-directions.webp
    ├── aizawa-reactions.webp
    └── ... (278 files)
```

### CORS Policy

In [`src/hooks/use-download.ts`](../src/hooks/use-download.ts), browser downloads use `fetch(url)` &rarr; `response.blob()` to trigger an immediate download with the clean filename (`<id>-directions.webp`).

Without an active CORS policy on R2, cross-origin `fetch()` requests from `http://localhost:3000` or `https://aniboop.nmrisrl.dev` are blocked by browser security and fall back to opening raw images in a new browser tab.

**R2 Bucket CORS Configuration:**

```json
[
	{
		"AllowedOrigins": [
			"http://localhost:3000",
			"https://aniboop.nmrisrl.dev",
			"https://*.nmrisrl.dev",
			"https://aniboop.vercel.app"
		],
		"AllowedMethods": ["GET", "HEAD"],
		"AllowedHeaders": ["*"],
		"ExposeHeaders": ["Content-Length", "Content-Type"],
		"MaxAgeSeconds": 3600
	}
]
```

---

## Environment Variables

### Local Development ([`.env.local`](../.env.local))

```env
# Public domain used by the frontend to construct all mascot asset URLs
NEXT_PUBLIC_R2_ASSETS_URL=https://aniboop-assets.nmrisrl.dev

# R2 S3-Compatible API credentials for automated CLI syncing (Git-ignored, local only)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=aniboop-assets
```

### Production & Preview Deployments (Vercel / Cloudflare Pages)

Only the public URL is required on Vercel — set it for **both Production and Preview** (since local `previews/` and `gallery-sheets/` are Git-ignored):

- **`NEXT_PUBLIC_R2_ASSETS_URL`**: `https://aniboop-assets.nmrisrl.dev`

_(S3 upload credentials `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` stay strictly local in `.env.local` and should never be added to Vercel.)_

---

## R2 Sync Script (`scripts/sync-r2.py`)

The sync script provides automated upload, verification, and audit tools powered by `boto3`.

### Command Overview

| Command                                      | Purpose                                                                                            |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `npm run mascot:sync-r2`                     | Parallel-sync all missing or size-modified WebPs (`previews/`, `gallery-sheets/`, `sheets/`) to R2 |
| `npm run mascot:sync-r2 -- --check`          | Audit that every character in `characters.json` has all 5 assets present on R2                     |
| `npm run mascot:sync-r2 -- --character <id>` | Upload all 5 WebPs (`previews/`, `gallery-sheets/`, `sheets/`) for a single mascot                 |
| `npm run mascot:sync-r2 -- --tier previews`  | Limit sync or audit to a single tier (`previews`, `gallery-sheets`, `sheets`, or `all`)            |
| `npm run mascot:sync-r2 -- --sync-versions`  | Recompute and write 8-character SHA-256 revision hashes (`v`) into `src/data/characters.json`      |
| `npm run mascot:sync-r2 -- --dry-run`        | Preview what would be uploaded without making any network changes                                  |
| `npm run mascot:sync-r2 -- --force`          | Re-upload files even if file sizes already match in R2 (useful to refresh object headers)          |

### Adding a Mascot with Automated R2 Upload

When adding a mascot via [`scripts/add-mascot.py`](../scripts/add-mascot.py), R2 synchronization is **automatic**:

```bash
npm run mascot:add -- --id <id> --name "<Name>" --series "<Series>"
```

1. Validates the 1080 × 1080 source sheets in `public/mascots/raw/`.
2. Generates all 5 WebP assets (`sheets/`, `previews/`, and `gallery-sheets/`).
3. Computes the 8-char SHA-256 content hash (`v`) and appends `{ id, name, series, v }` to `src/data/characters.json`.
4. Archives original source sheets to `public/mascots/raw/processed/`.
5. **Calls `scripts/sync-r2.py --character <id>`** to upload all 5 WebPs directly to Cloudflare R2 with `Cache-Control: public, max-age=31536000, immutable`.
6. If credentials are unset or offline, it gracefully reports that R2 upload was skipped without failing the local addition.

### Updating an Existing Mascot's Artwork

Use [`scripts/update-mascot.py`](../scripts/update-mascot.py) when replacing an existing character's source pair in `public/mascots/raw/`:

```bash
npm run mascot:update -- --id <id>
```

1. Backs up any existing local WebPs to `public/old-version/mascots/`.
2. Re-optimizes the 1080 sheets and regenerates previews and compact playback sheets.
3. Recomputes and updates `v` in `src/data/characters.json` so browser and Cloudflare caches invalidate immediately.
4. Archives the source pair and uploads all 5 updated WebPs directly to Cloudflare R2.

---

## Cloudflare Free Tier & Quota Reference

Cloudflare R2 free tier allowances renew monthly with **\$0 cost**:

- **Storage:** 10 GB / month free (AniBoop uses ~0.065 GB across all 695 WebPs for 139 characters; ~0.65% of quota).
- **Class A Operations (Upload / Write / List):** 1,000,000 requests / month free (Adding or updating 1 character = 5 writes).
- **Class B Operations (Download / Read):** 10,000,000 requests / month free (dramatically reduced by Cloudflare edge caching).
- **Egress (Bandwidth):** **\$0.00 unlimited free** (no outbound transfer fees).
- **API Tokens:** Free with unlimited generation.
