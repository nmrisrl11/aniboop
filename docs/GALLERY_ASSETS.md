# Gallery assets

The [character catalog](../src/data/characters.json) holds stable IDs, display names, and series. The endless grid repeats the catalog in spiral order, so a cell resolves to the same character whenever you pan back within the same catalog version.

The local [Mascot component](../src/components/mascot/mascot.tsx) accepts matching 3 × 3 sheets from any character. The direction sheet has the front-facing pose in the center. Reaction slot names follow the upstream order of blink, heart, sparkle, surprised, wink, bashful, sleepy, dizzy, and delighted.

See [character artwork licensing](LICENSING.md#artwork-and-branding) before reusing or redistributing gallery images.

## Gallery loading

The [homepage](../src/app/page.tsx) passes the lightweight catalog entries (`{ id, name, series, v }`) from [the catalog adapter](../src/data/characters.ts) to `<Gallery>`, which derives the versioned Cloudflare R2 asset URLs client-side via [`src/lib/assets.ts`](../src/lib/assets.ts) (keeping the SSR HTML payload compact). All three mascot WebP tiers — `previews/`, `gallery-sheets/`, and 1080 × 1080 `sheets/` — are Git-ignored locally and served from Cloudflare R2 (`NEXT_PUBLIC_R2_ASSETS_URL`) with `Cache-Control: public, max-age=31536000, immutable` and `?v=<hash>` cache busting (see the [R2 storage guide](R2_STORAGE.md)). When `NEXT_PUBLIC_R2_ASSETS_URL` is unset, URLs fall back to local `/mascots/` files for offline development.

| Stage                | Asset loaded                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial SSR paint    | A centered 7 × 5 tile window renders with outer card chrome and centered, GPU-composited `bloom` placeholders before JS hydrates.                                                                                                        |
| Initial view or pan  | A 248 × 248 center-pose WebP for each mascot entering view. Mascots mount after decode completes, crossfading in with their captions; decoded URLs stay cached in memory so revisited or repeated tiles skip the loader.                 |
| Cursor tracking      | A 504 × 504 WebP with nine poses for each visible mascot, proximity-staggered and concurrency-limited (max 4 low-priority decodes) when an unpressed fine pointer moves, cancelling queued loads if panning starts or the tile unmounts. |
| Boop, hold, or pinch | The selected mascot's 504 × 504 reaction sheet. The current pose stays visible until the sheet decodes.                                                                                                                                  |

Repeated tiles share asset URLs. The browser can reuse image responses, and the component shares in-flight sprite sheet decodes across copies. Focusing a card with Tab only needs its preview. A drag that begins on a mascot yields to the grid before triggering a reaction.

All three mascot tiers are served from Cloudflare R2 with `Cache-Control: public, max-age=31536000, immutable`. Each catalog entry stores an 8-character SHA-256 content hash (`v`) appended as `?v=<hash>`, so replacing a character's artwork immediately busts both browser and Cloudflare caches. The root layout emits a `<link rel="preconnect">` hint for the R2 origin so TLS setup happens in parallel with HTML parsing.

### Gallery-wide cursor tracking

Visible mascots follow the cursor across the gallery, including over captions and gaps, once their direction sheets decode. One shared pointer listener delivers the latest position each animation frame using cached tile bounding rects (invalidated on pan resume and resize). Direction sheet upgrades stagger by pointer distance and decode through a cancellable low-priority queue so quick pans or brief mouse movements do not flood bandwidth. A press keeps each mascot's last gaze pose. Panning resets gaze to the center pose. Tracking resumes on the next unpressed movement once the grid is still. Touch-only and reduced-motion visitors use the center-pose previews until they trigger a reaction.

## Adding a mascot

Install the Python image tools once with `python -m pip install Pillow numpy`. Put two 1080 × 1080 sheets in `public/mascots/raw/`. Each sheet must be a 3 × 3 grid of 360 × 360 tiles. Use PNG or WebP and the same lowercase, hyphenated character ID for both files.

- `<id>-directions.png` or `<id>-directions.webp`
- `<id>-reactions.png` or `<id>-reactions.webp`

Use `Dragon Ball` for characters from both `Dragon Ball` and `Dragon Ball Z` so the catalog lists them together.

Run this from the repository root with your character's metadata.

```sh
npm run mascot:add -- --id star-cat --name "Star Cat" --series "Original Characters"
```

The command validates the pair, runs the optimizer, and generates the center-pose preview and two compact pose sheets in a staging directory. It uploads all five WebPs directly to Cloudflare R2 before publishing `{ id, name, series, v }` in `src/data/characters.json` (preventing open dev tabs from hitting un-uploaded `?v=<hash>` URLs), then writes the two WebPs to `public/mascots/sheets/`, one still to `public/mascots/previews/`, and two playback sheets to `public/mascots/gallery-sheets/`, and moves the original pair to `public/mascots/raw/processed/`. The command rejects duplicate catalog IDs and existing archive files with the same names. For multiple characters, run the command once per complete pair. Git tracks only `public/mascots/raw/README.md` and `src/data/characters.json`; all local raw, processed, preview, compact, and master WebP folders are Git-ignored. Open the gallery to check the framing, gaze, and boop, then commit `src/data/characters.json` (and any README updates).

When the catalog changes, update the [README](../README.md) using the number of catalog entries and the number of distinct `series` values. For a batch, update the totals after the final addition. Check the [featured previews](../README.md#featured-characters) when a featured character's ID, name, or preview changes — when updating a featured character's artwork, include `?v=<new_hash>` on its image URL in `README.md` so Cloudflare and GitHub's image proxy fetch the updated preview. Keep the lineup curated and include any README edits with the catalog change.

## Replacing an existing mascot

Place the revised 1080 × 1080 `<id>-directions` and `<id>-reactions` pair in `public/mascots/raw/` and run:

```sh
npm run mascot:update -- --id <character-id>
```

The command re-optimizes the 1080 sheets and regenerates the preview and compact sheets in a staging directory, uploads all five updated WebPs directly to Cloudflare R2 first (so Cloudflare never caches the previous artwork under the new immutable `?v=<hash>` URL), backs up existing local WebPs under `public/old-version/mascots/`, refreshes the character's `v` cache-busting hash in `src/data/characters.json`, and archives the raw pair. Avoid using `--skip-r2` while `next dev` is open against live R2 (sync to R2 before loading the page). Verify the new preview, gaze, and boop in the gallery (or run `npm run mascot:sync-r2 -- --verify-cdn --character <character-id>`), then commit the updated `src/data/characters.json`.

## Preparing sprite sheets

Put the direction and reaction sheets in `public/mascots/raw/`. Use PNG or WebP and name the files `<character-id>-directions` and `<character-id>-reactions` with the appropriate extension. Each sheet should be a 1080 × 1080 image with a 3 × 3 grid of 360 × 360 tiles.

For asset-only work, run these commands from the repository root with Python 3 available as `python`.

```sh
python -m pip install Pillow numpy
npm run mascot:optimize -- --dry-run
npm run mascot:optimize
python scripts/generate-mascot-previews.py
```

The dry run reports projected sizes without writing image files. The regular run writes WebP files to `public/mascots/sheets/`. By default it zeros out pixels with an alpha value of 1, clears RGB values under fully transparent pixels, and encodes color with lossy compression and the cleaned alpha channel at full quality. Use `--character <id>` to process one character’s sheets. For standalone optimization, `--move` archives the source sheets in `public/mascots/raw/processed/`; use `mascot:add` for new catalog entries.

See the [optimize-mascot skill](../.agents/skills/optimize-mascot/SKILL.md) for agent usage and the [CLI guide](../.agents/skills/optimize-mascot/references/cli_usage.md) for all options.

The [preview generator](../scripts/generate-mascot-previews.py) processes the catalog when run against the repository's asset directory. It centers the visible artwork of the neutral pose horizontally and aligns it to a shared baseline. A single proportional transform applies to all 18 poses. The generator reduces the scale when a wider or taller pose needs more clearance. It writes `<character-id>.webp` to `previews/` and the matching `-directions.webp` and `-reactions.webp` to `gallery-sheets/`. Pass `--character <id>` to rebuild all three gallery assets for one character from its optimized direction and reaction pair. Use [Adding a mascot](#adding-a-mascot) when the character also needs a catalog entry.

## Scaling the catalog

The current catalog fits cleanly in the initial HTML payload because only compact `{ id, name, series, v }` entries are serialized and URLs are derived client-side. If metadata grows far enough to affect startup, publish versioned static catalog pages keyed by index range and load the pages needed for the visible window. A distant pan should be able to request its pages directly. Use catalog revisions in cache keys. Consider a database when editing or search needs server-side queries.

All three mascot WebP tiers (`previews/`, `gallery-sheets/`, and 1080 × 1080 `sheets/`) are Git-ignored and delivered from Cloudflare R2 (`NEXT_PUBLIC_R2_ASSETS_URL`) with `?v=<hash>` cache busting and \$0 egress. See the [R2 storage guide](R2_STORAGE.md) for bucket configuration, CORS policy, cache TTL settings, and automated sync workflows. Show formats, usage terms, and applicable attribution. Profile long pans, cold transfer, first-boop latency, and image memory on a representative phone as the catalog grows.
