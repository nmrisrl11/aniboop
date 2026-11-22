# Architecture

| Area                                       | Location                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| App Router and homepage                    | [`src/app`](../src/app)                                   |
| Header layout and boop-order control       | [`src/components/header`](../src/components/header)       |
| Character catalog and search               | [`src/components/catalog`](../src/components/catalog)     |
| Component guide, credits, and GitHub link  | [`src/components/resources`](../src/components/resources) |
| Theme provider and appearance control      | [`src/components/theme`](../src/components/theme)         |
| Gallery viewport and tiles                 | [`src/components/gallery`](../src/components/gallery)     |
| Mascot rendering and gestures              | [`src/components/mascot`](../src/components/mascot)       |
| Shared brand copy                          | [`src/lib/brand.ts`](../src/lib/brand.ts)                 |
| Tailwind v4 theme and shadcn CSS variables | [`src/app/globals.css`](../src/app/globals.css)           |
| shadcn Radix Nova configuration            | [`components.json`](../components.json)                   |
| shadcn component source                    | [`src/components/ui`](../src/components/ui)               |

## Gallery

The homepage is a Server Component that renders a client viewport. [CharacterGrid](../src/components/gallery/character-grid.tsx) repeats the [character catalog](../src/data/characters.json) by taking the spiral cell index modulo the catalog length. The viewport uses an [adaptation of Thiings Grid](https://github.com/charlieclark/thiings-grid/blob/a1607d3cee9e6969f5f504f0c253ee94aa50bf54/lib/ThiingsGrid.tsx) with its [MIT license](../src/components/gallery/THIINGS-GRID-LICENSE.txt).

The grid calculates a window from viewport dimensions and cell size. It maps coordinates to stable spiral indices and mounts the visible cells plus a buffer. Pointer movement updates one translated layer once per animation frame. React updates the cell window when the center crosses a cell or the viewport resizes. A shared intersection observer mounts mascot buttons and artwork as they enter view. Tab reaches buttons with at least half of their area visible. Arrow keys pan from the grid or a focused mascot. Reduced motion disables drag momentum.

The local [Mascot component](../src/components/mascot/mascot.tsx) adapts the portfolio implementation and [page-mascot](https://github.com/nilbuild/page-mascot) under its [MIT license](../src/components/mascot/PAGE-MASCOT-LICENSE.txt). The component accepts sprite URLs, a reaction mode and pool, hold and release expressions, and an optional reaction callback. A pointer that moves beyond the drag threshold before a hold starts pans the grid. An active hold or two-finger pinch controls the mascot until release. Reduced motion disables gaze tracking and deformation while preserving expression changes.

The homepage resolves the content-hashed WebP URLs during the production build and passes them to the grid. One [shared pointer listener](../src/components/mascot/page-pointer.ts) updates the gaze of visible mascots. The grid suspends tracking while it pans. See the [gallery assets guide](GALLERY_ASSETS.md) for request timing and cache behavior.

## Header and catalog

The [app header](../src/components/header/app-header.tsx) composes the component guide, credits, GitHub repository link, boop order, character catalog, theme switcher, and reaction sound toggle. Below 48 rem, the full-color logo and Catalog stay visible alongside the [More options popover](../src/components/header/header-options.tsx), which contains the secondary controls. The gallery shares the selected boop order with the grid.

The [character catalog](../src/components/catalog/character-catalog.tsx) uses shadcn Input and Select controls above its scrolling results. It groups and normalizes the data once per catalog change, applies text queries after a 150 ms pause, and cancels any pending query when the dialog closes. The [component guide](../src/components/resources/component-docs-modal.tsx) uses shadcn Code Block with Shiki syntax highlighting, which loads when the guide opens.

## Reaction audio

[Gallery](../src/components/gallery/gallery.tsx) owns the [sound hook](../src/hooks/use-reaction-sound.ts) and passes its playback callback through the grid to `Mascot.onReact`. The callback receives the expression after the reaction sheet decodes and as each frame is selected for display. Build up can emit both blink and its follow-up expression, and an interrupted sequence skips callbacks for its canceled frames. Standalone Mascot instances can supply their own callback.

Enabling sound creates one Web Audio context during the button activation so delayed hold and pinch frames can use it. The hook synthesizes each cue on first use, caches the buffer, and plays up to three overlapping cues across the gallery. Muting stops active cues immediately. A suspended context can resume on the next gallery interaction, and frames shown while audio is unavailable remain silent.

The [presets](../src/lib/audio/reaction-sounds.ts) are keyed by the nine names in the reaction atlas. Each preset uses the parameter order of [ZzFXMicro 1.4.0](https://github.com/KilledByAPixel/ZzFX/blob/master/ZzFXMicro.js). The local [ZzFX port](../src/lib/audio/zzfx.ts) builds audio buffers using Web Audio. It has no npm dependency or audio asset requests. See the [MIT license](../src/lib/audio/ZzFX-LICENSE.txt) and use the [ZzFX sound designer](https://killedbyapixel.github.io/ZzFX/) to audition changes.

| Expression | Sound                   |
| ---------- | ----------------------- |
| Blink      | Soft eyelid tick        |
| Heart      | Warm double pulse       |
| Sparkle    | High glint with an echo |
| Surprised  | Quick upward squeak     |
| Wink       | Two-tone chirp          |
| Bashful    | Soft falling note       |
| Sleepy     | Slow, low sigh          |
| Dizzy      | Cycling wobble          |
| Delighted  | Bright rising chime     |

## Theme

The appearance control defaults to the system color preference. The root [theme provider](../src/components/theme/theme-provider.tsx) uses `next-themes` to persist the preference and apply the correct class before the first paint. Light tokens are defined in `:root` and dark overrides live in `.dark`. Tailwind exposes both palettes through `@theme inline`. Use semantic utilities such as `bg-card`, `text-foreground`, and `border-input` across both palettes.

## Fonts and metadata

The root layout loads Allo Bold and the upright Latin subset of Inter Variable through `next/font/local`. Both are served from the app with `font-display: swap` and global preloading disabled. Use `font-heading font-bold` for display type, `font-sans` for interface text, and `font-mono` for technical values that benefit from a system monospace face.

Next.js adds browser icon links from the [SVG tap mark](../src/app/icon.svg), [ICO favicon](../src/app/favicon.ico) with 16, 32, and 48 px frames, and [180 px Apple touch icon](../src/app/apple-icon.png). The [manifest route](../src/app/manifest.ts) serves `/manifest.webmanifest` with 192 px and 512 px PNGs from [public/icons](../public/icons). It also declares a separate, opaque 512 px maskable icon for launchers that crop icons to a system shape.

The [social image route](../src/app/opengraph-image.tsx) combines the same full-color SVG used in the header with the tap mark and slogan. Next.js uses the 1200 × 630 PNG for Open Graph and Twitter cards. See [SEO and site discovery](SEO.md) for the production origin, crawler rules, and verification steps.

AniBoop's official hostname is `aniboop.nmrisrl.dev`. The [Vercel backup runbook](SEO.md#backup-access-on-vercel) records the status of `aniboop.vercel.app` and covers access during a parent-domain outage.
