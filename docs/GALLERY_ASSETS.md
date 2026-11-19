# Gallery assets

The [character catalog](../src/data/characters.json) holds stable IDs, display names, and series. The [TypeScript adapter](../src/data/characters.ts) derives asset URLs and applies custom reaction orders. The endless grid repeats the catalog in spiral order, so a cell resolves to the same character whenever you pan back within the same catalog version.

The local [Mascot component](../src/components/mascot/mascot.tsx) accepts matching 3 × 3 sheets from any character. The direction sheet has the front-facing pose in the center. Reaction slot names follow the upstream order of blink, heart, sparkle, surprised, wink, bashful, sleepy, dizzy, and delighted. Nomer's first slot is neutral, so his cycle starts with the grin in the second slot and wraps through all nine.

## Gallery loading

| Stage                | Asset loaded                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Initial view or pan  | A 248 × 248 center-pose WebP for each mascot entering view. Overscan cells reserve space.                 |
| Cursor tracking      | A 504 × 504 WebP with nine poses for each visible mascot, requested when an unpressed fine pointer moves. |
| Boop, hold, or pinch | The selected mascot's reaction sheet. The current pose stays visible until the sheet decodes.             |

Repeated tiles share asset URLs. The browser can reuse image responses, and the component shares in-flight sprite sheet decodes across copies. Focusing a card with Tab only needs its preview. A drag that begins on a mascot yields to the grid before triggering a reaction.

The production build emits the gallery's center previews, compact direction sheets, and reaction sheets at content-hashed Next.js static URLs. Next.js serves them with `Cache-Control: public, max-age=31536000, immutable`. Editing a WebP changes its URL on the next build. The homepage passes these URLs to the grid, which requests the files at the stages above.

### Gallery-wide cursor tracking

Visible mascots follow the cursor across the gallery, including over captions and gaps, once their direction sheets decode. One shared pointer listener delivers the latest position each animation frame. A press resets the gaze. Tracking resumes on movement after release and after the grid stops panning. Touch-only and reduced-motion visitors use the center-pose previews until they trigger a reaction.

## Adding a mascot

Install the Python image tools once with `python -m pip install Pillow numpy`. Put two 1080 × 1080 sheets in `public/mascots/raw/`. Each sheet must be a 3 × 3 grid of 360 × 360 tiles. Use PNG or WebP and the same lowercase, hyphenated character ID for both files.

- `<id>-directions.png` or `<id>-directions.webp`
- `<id>-reactions.png` or `<id>-reactions.webp`

Run this from the repository root with your character's metadata.

```sh
npm run mascot:add -- --id star-cat --name "Star Cat" --series "Original Characters"
```

The command validates the pair, runs the optimizer, and generates the center-pose preview and compact direction sheet. It writes two WebPs to `public/mascots/sheets/` and two to `public/mascots/previews/`, then appends the catalog entry. It leaves the originals in `raw/` and rejects an ID already in the catalog. Open the gallery to check the gaze and boop, then include the catalog change and the four generated WebPs when committing the mascot.

## Preparing sprite sheets

Put the direction and reaction sheets in `public/mascots/raw/`. Use PNG or WebP and name the files `<character-id>-directions` and `<character-id>-reactions` with the appropriate extension. Each sheet should be a 1080 × 1080 image with a 3 × 3 grid of 360 × 360 tiles.

For asset-only work, run these commands from the repository root with Python 3 available as `python`.

```sh
python -m pip install Pillow numpy
npm run mascot:optimize -- --dry-run
npm run mascot:optimize
python scripts/generate-mascot-previews.py
```

The dry run reports projected sizes without writing image files. The regular run writes WebP files to `public/mascots/sheets/`. By default it zeros out pixels with an alpha value of 1, clears RGB values under fully transparent pixels, and encodes color with lossy compression and the cleaned alpha channel at full quality. Use `--character <id>` to process one character’s sheets and `--move` to archive processed source sheets in `public/mascots/raw/archive/`.

See the [optimize-mascot skill](../.agents/skills/optimize-mascot/SKILL.md) for agent usage and the [CLI guide](../.agents/skills/optimize-mascot/references/cli_usage.md) for all options.

The [preview generator](../scripts/generate-mascot-previews.py) writes `public/mascots/previews/<character-id>.webp` from the center cell and `public/mascots/previews/<character-id>-directions.webp` from all nine cells. Pass `--character <id>` to rebuild both gallery assets for one character. Use [Adding a mascot](#adding-a-mascot) when the character also needs a catalog entry.

## Scaling the catalog

The current catalog fits in the client bundle. If the metadata grows enough to affect startup, publish versioned static catalog pages keyed by index range and load the pages needed for the visible window. A distant pan should be able to request its pages directly. Use catalog revisions in cache keys. Consider a database when editing or search needs server-side queries.

The repository keeps source WebPs under `public/mascots/`. The gallery uses same-origin, content-hashed build output. Cloudflare R2 with a custom domain is an option for moving images off the app deployment. Preserve content-versioned URLs if moving the files to another host. Cloudflare recommends a custom domain for cached production traffic. [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

When downloads are added, keep them separate from previews and fetch them on demand. Show formats, usage terms, and applicable attribution. Profile long pans, cold transfer, first-boop latency, and image memory on a representative phone as the catalog grows.
