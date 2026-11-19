# Gallery assets

The [character catalog](../src/data/characters.json) holds stable IDs, display names, and series. The [TypeScript adapter](../src/data/characters.ts) derives asset URLs and applies custom reaction orders. The endless grid repeats the catalog in spiral order, so a cell resolves to the same character whenever you pan back within the same catalog version.

The local [Mascot component](../src/components/mascot/mascot.tsx) accepts matching 3 × 3 sheets from any character. The direction sheet has the front-facing pose in the center. Reaction slot names follow the upstream order of blink, heart, sparkle, surprised, wink, bashful, sleepy, dizzy, and delighted. Nomer's first slot is neutral, so his cycle starts with the grin in the second slot and wraps through all nine.

## Gallery loading

| Stage                | Asset loaded                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Initial view or pan  | A 248 × 248 center-pose WebP for each mascot entering view. Overscan cells reserve space.                                  |
| Cursor tracking      | The hovered mascot's direction sheet after a short delay near an edge of its button. Tracking pauses while the grid moves. |
| Boop, hold, or pinch | The selected mascot's reaction sheet. The current pose stays visible until the sheet decodes.                              |

Repeated tiles share asset URLs. The browser can reuse image responses, and the component shares in-flight sprite sheet decodes across copies. Focusing a card with Tab only needs its preview. A drag that begins on a mascot yields to the grid before triggering a reaction.

### Proposed gallery-wide cursor tracking

Use a smaller nine-pose WebP sheet for each visible mascot on devices with a fine pointer. Each visible mascot can then follow the pointer across the gallery as soon as its sheet loads. The browser changes the position of the loaded image to select a pose. Keep the center-pose previews for touch-only and reduced-motion visitors, and continue loading reaction sheets on demand.

In the 390 × 540 Chromium test, the nine center-pose previews transferred about 90 KiB. The existing full-size direction sheets for those same characters total about 1.17 MiB. Measure a smaller sheet's transfer size and visual quality before deciding on its dimensions.

## Adding a mascot

Install the Python image tools once with `python -m pip install Pillow numpy`. Put two 1080 × 1080 sheets in `public/mascots/raw/`. Each sheet must be a 3 × 3 grid of 360 × 360 tiles. Use PNG or WebP and the same lowercase, hyphenated character ID for both files.

- `<id>-directions.png` or `<id>-directions.webp`
- `<id>-reactions.png` or `<id>-reactions.webp`

Run this from the repository root with your character's metadata.

```sh
npm run mascot:add -- --id star-cat --name "Star Cat" --series "Original Characters"
```

The command validates the pair, runs the optimizer, and generates the center-pose preview. It writes two WebPs to `public/mascots/sheets/` and one to `public/mascots/previews/`, then appends the catalog entry. It leaves the originals in `raw/` and rejects an ID already in the catalog. Open the gallery to check the pose and boop, then include the catalog change and the three generated WebPs when committing the mascot.

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

The [preview generator](../scripts/generate-mascot-previews.py) crops the center cell from each optimized direction sheet and writes `public/mascots/previews/<character-id>.webp`. Pass `--character <id>` to rebuild a single preview. Use [Adding a mascot](#adding-a-mascot) when the character also needs a catalog entry.

## Scaling the catalog

The current catalog fits in the client bundle. If the metadata grows enough to affect startup, publish versioned static catalog pages keyed by index range and load the pages needed for the visible window. A distant pan should be able to request its pages directly. Use catalog revisions in cache keys. Consider a database when editing or search needs server-side queries.

Assets currently use same-origin paths under `public/mascots/`. Cloudflare R2 with a custom domain is an option for moving images off the app deployment. Keep the same paths under a versioned prefix for long-lived caching and update the shared asset URL builder. Cloudflare recommends a custom domain for cached production traffic. [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

When downloads are added, keep them separate from previews and fetch them on demand. Show formats, usage terms, and applicable attribution. Profile long pans, cold transfer, first-boop latency, and image memory on a representative phone as the catalog grows.
