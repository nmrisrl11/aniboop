# Gallery assets

The [character catalog](../src/data/characters.json) holds stable IDs, display names, and series. The endless grid repeats the catalog in spiral order, so a cell resolves to the same character whenever you pan back within the same catalog version.

The local [Mascot component](../src/components/mascot/mascot.tsx) accepts matching 3 × 3 sheets from any character. The direction sheet has the front-facing pose in the center. Reaction slot names follow the upstream order of blink, heart, sparkle, surprised, wink, bashful, sleepy, dizzy, and delighted.

See [character artwork licensing](LICENSING.md#artwork-and-branding) before reusing or redistributing gallery images.

## Gallery loading

The [homepage](../src/app/page.tsx) calls `getGalleryCharacters` in the [catalog adapter](../src/data/characters.ts). The adapter imports the center previews from `public/mascots/previews/` and the compact direction and reaction sheets from `public/mascots/gallery-sheets/`. [CharacterGrid](../src/components/gallery/character-grid.tsx) passes those three URLs to each visible mascot. The preview generator uses the local, Git-ignored full-size sheets in `public/mascots/sheets/`. Keep that folder out of deployment artifacts because Next.js serves files under `public/` directly. Cloudflare R2 is the planned source for full-size downloads.

| Stage                | Asset loaded                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Initial view or pan  | A 248 × 248 center-pose WebP for each mascot entering view. Overscan cells reserve space.                 |
| Cursor tracking      | A 504 × 504 WebP with nine poses for each visible mascot, requested when an unpressed fine pointer moves. |
| Boop, hold, or pinch | The selected mascot's 504 × 504 reaction sheet. The current pose stays visible until the sheet decodes.   |

Repeated tiles share asset URLs. The browser can reuse image responses, and the component shares in-flight sprite sheet decodes across copies. Focusing a card with Tab only needs its preview. A drag that begins on a mascot yields to the grid before triggering a reaction.

The production build emits the gallery's center previews and compact pose sheets at content-hashed Next.js static URLs. Next.js serves them with `Cache-Control: public, max-age=31536000, immutable`. Editing a WebP changes its URL on the next build. The homepage passes these URLs to the grid, which requests the files at the stages above.

### Gallery-wide cursor tracking

Visible mascots follow the cursor across the gallery, including over captions and gaps, once their direction sheets decode. One shared pointer listener delivers the latest position each animation frame. A press keeps each mascot's last gaze pose. Panning resets gaze to the center pose. Tracking resumes on the next unpressed movement once the grid is still. Touch-only and reduced-motion visitors use the center-pose previews until they trigger a reaction.

## Adding a mascot

Install the Python image tools once with `python -m pip install Pillow numpy`. Put two 1080 × 1080 sheets in `public/mascots/raw/`. Each sheet must be a 3 × 3 grid of 360 × 360 tiles. Use PNG or WebP and the same lowercase, hyphenated character ID for both files.

- `<id>-directions.png` or `<id>-directions.webp`
- `<id>-reactions.png` or `<id>-reactions.webp`

Use `Dragon Ball` for characters from both `Dragon Ball` and `Dragon Ball Z` so the catalog lists them together.

Run this from the repository root with your character's metadata.

```sh
npm run mascot:add -- --id star-cat --name "Star Cat" --series "Original Characters"
```

The command validates the pair, runs the optimizer, and generates the center-pose preview and two compact pose sheets. It writes two WebPs to `public/mascots/sheets/`, one still to `public/mascots/previews/`, and two playback sheets to `public/mascots/gallery-sheets/`. A successful run appends the catalog entry and moves the original pair to `public/mascots/raw/processed/`. The command rejects duplicate catalog IDs and existing archive files with the same names. For multiple characters, run the command once per complete pair. Git tracks the raw folder's README and ignores the source, processed, and full-size sheets. Open the gallery to check the framing, gaze, and boop, then commit the catalog change, center still, and two compact pose sheets.

When the catalog changes, update the [README](../README.md) using the number of catalog entries and the number of distinct `series` values. For a batch, update the totals after the final addition. Check the [featured previews](../README.md#featured-characters) when a featured character's ID, name, or preview path changes. Keep the lineup curated and include any README edits with the catalog change.

## Replacing an existing mascot

Before replacing artwork, copy and verify the five existing WebPs under `public/old-version/mascots/`, keeping their `sheets/`, `previews/`, and `gallery-sheets/` paths. Git ignores this backup folder. Use the asset-only workflow to regenerate the WebPs for the existing ID and keep its catalog entry intact. Verify the new preview, gaze, and boop in the gallery before archiving the incoming source pair.

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

The current catalog fits in the client bundle. If the metadata grows enough to affect startup, publish versioned static catalog pages keyed by index range and load the pages needed for the visible window. A distant pan should be able to request its pages directly. Use catalog revisions in cache keys. Consider a database when editing or search needs server-side queries.

Git tracks the gallery previews and compact pose sheets. The gallery serves them from same-origin, content-hashed build output. Preserve content-versioned URLs if moving gallery assets to another host.

When downloads are added, fetch the full-size sheets from Cloudflare R2 on demand using `NEXT_PUBLIC_R2_ASSETS_URL` to offload bandwidth and eliminate egress fees. When unset, downloads fall back to local compact sheets. See the [R2 storage guide](R2_STORAGE.md) for bucket configuration, CORS policy, and automated sync workflows. Show formats, usage terms, and applicable attribution. Profile long pans, cold transfer, first-boop latency, and image memory on a representative phone as the catalog grows.
