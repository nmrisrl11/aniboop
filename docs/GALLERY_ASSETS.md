# Gallery assets

The current grid generates text placeholders from their indices. The sprite optimizer runs separately from the app.

## Preparing sprite sheets

Put the direction and reaction sheets in `public/mascots/raw/`. Use PNG or WebP and name the files `<character-id>-directions` and `<character-id>-reactions` with the appropriate extension. Each sheet should be a 1080 × 1080 image with a 3 × 3 grid of 360 × 360 tiles.

Run these commands from the repository root with Python 3 available as `python`.

```sh
python -m pip install Pillow numpy
npm run mascot:optimize -- --dry-run
npm run mascot:optimize
```

The dry run reports projected sizes without writing image files. The regular run writes WebP files to `public/mascots/sheets/`. By default it zeros out pixels with an alpha value of 1, clears RGB values under fully transparent pixels, and encodes color with lossy compression and the cleaned alpha channel at full quality. Use `--character <id>` to process one character’s sheets and `--move` to archive processed source sheets in `public/mascots/raw/archive/`.

See the [optimize-mascot skill](../.agents/skills/optimize-mascot/SKILL.md) for agent usage and the [CLI guide](../.agents/skills/optimize-mascot/references/cli_usage.md) for all options.

## Planned gallery delivery

| Stage           | Load                                                                                                      | Cache and rendering                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First view      | Minimal metadata for the visible region, including character IDs, display names, and thumbnail references | Keep the initial response small. Reserve each tile's dimensions and show a placeholder until its preview is ready.                                                                    |
| Panning         | Fetch the catalog pages intersecting the visible window and a small buffer around it                      | Deduplicate in-flight requests by page and catalog revision. Reuse a bounded memory cache when a visitor pans back. Deprioritize obsolete requests and keep prefetch concurrency low. |
| Preview         | Serve a static thumbnail sized to the tile and device pixel ratio                                         | Give visible images priority. Keep nearby previews low priority and leave farther cells on placeholders. Use versioned URLs so the browser and CDN can reuse the images.              |
| Boop or details | Fetch the selected character's reaction or direction data as needed                                       | Keep the tile usable while the reaction loads. Reuse a bounded cache for recently used assets, and pause active animations when they leave the viewport.                              |
| Download        | Fetch the selected export when the user requests it                                                       | Keep downloadable files separate from previews. Show formats, usage terms, and attribution before download.                                                                           |

Keep character identity separate from viewport coordinates. Use stable character IDs for assets and a stable ordering within each catalog revision. The grid can pan directly into a distant region, so metadata lookup should support requesting the corresponding pages without fetching every preceding page. Key and invalidate cached entries when the catalog or assets change.

Mount only visible cells and a small overscan buffer. Use a single translated layer for panning. Keep decoding, animation setup, and fetching out of the pointer event handler. Account for decoded sprite memory as well as transfer size when setting cache limits.

Before shipping the catalog, profile long pans and quick flicks on a representative phone. Measure cold and repeat transfer, request count, dropped frames, first-boop latency, and cache growth. Confirm that panning back reuses cached data and that crossing many catalog pages does not keep growing the mounted cell count or memory usage.
