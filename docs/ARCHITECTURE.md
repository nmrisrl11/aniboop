# Architecture

| Area                                       | Location                                        |
| ------------------------------------------ | ----------------------------------------------- |
| App Router and homepage                    | [`src/app`](../src/app)                         |
| Shared brand copy                          | [`src/lib/brand.ts`](../src/lib/brand.ts)       |
| Tailwind v4 theme and shadcn CSS variables | [`src/app/globals.css`](../src/app/globals.css) |
| shadcn Radix Nova configuration            | [`components.json`](../components.json)         |
| shadcn component source                    | [`src/components/ui`](../src/components/ui)     |

## Gallery

The homepage is a Server Component that renders a client viewport. [CharacterGrid](../src/components/gallery/character-grid.tsx) repeats the [character catalog](../src/data/characters.json) by taking the spiral cell index modulo the catalog length. The viewport uses an [adaptation of Thiings Grid](https://github.com/charlieclark/thiings-grid/blob/a1607d3cee9e6969f5f504f0c253ee94aa50bf54/lib/ThiingsGrid.tsx) with its [MIT license](../src/components/gallery/THIINGS-GRID-LICENSE.txt).

The grid calculates a window from viewport dimensions and cell size. It maps coordinates to stable spiral indices and mounts the visible cells plus a buffer. Pointer movement updates one translated layer once per animation frame. React updates the cell window when the center crosses a cell or the viewport resizes. A shared intersection observer mounts mascot buttons and artwork as they enter view. Tab reaches buttons with at least half of their area visible. Arrow keys pan from the grid or a focused mascot. Reduced motion disables drag momentum.

The local [Mascot component](../src/components/mascot/mascot.tsx) adapts the portfolio implementation and [page-mascot](https://github.com/nilbuild/page-mascot) under its [MIT license](../src/components/mascot/PAGE-MASCOT-LICENSE.txt). The component accepts sprite URLs, a reaction mode and pool, hold and release expressions, and an optional reaction callback. A pointer that moves beyond the drag threshold before a hold starts pans the grid. An active hold or two-finger pinch controls the mascot until release. Reduced motion disables gaze tracking and deformation while preserving expression changes.

The homepage resolves the content-hashed WebP URLs during the production build and passes them to the grid. One [shared pointer listener](../src/components/mascot/page-pointer.ts) updates the gaze of visible mascots. The grid suspends tracking while it pans. See the [gallery assets guide](GALLERY_ASSETS.md) for request timing and cache behavior.

## Theme

The preview follows the system color preference through CSS. Light values live in `:root` and dark values override those tokens inside `prefers-color-scheme`. Tailwind exposes the tokens through `@theme inline`. Use semantic utilities such as `bg-card`, `text-foreground`, and `border-input` across both palettes.

## Fonts and metadata

The root layout loads Allo Bold and the upright Latin subset of Inter Variable through `next/font/local`. Both are served from the app with `font-display: swap` and global preloading disabled. Use `font-heading font-bold` for display type, `font-sans` for interface text, and `font-mono` for technical values that benefit from a system monospace face.

Next.js derives favicon and social image routes from `icon.svg` and `opengraph-image.tsx`. Set `ANIBOOP_URL` to the public origin at build time when deploying so metadata resolves share images against the correct host.
