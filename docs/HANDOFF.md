# Load AniBoop project context

Open the AniBoop repository in a new agent chat and paste this prompt. Append your task on a new line if you already have one.

> Load the AniBoop project context by following `docs/HANDOFF.md`. If I included a task, use that context and proceed. Otherwise, summarize the app, checkout state, and open work in a few bullets.

## Context-loading workflow

1. Read [AGENTS.md](../AGENTS.md), the [README](../README.md), and the product and implementation overview below. Use the README for the project’s purpose and setup and `AGENTS.md` for repository rules and applicable skills.
2. Run `git status --short --branch` and `git log -5 --oneline` from the repository root. Review relevant working changes if a task was supplied. Preserve existing edits. If Git is unavailable, continue with the files and say which checkout details you could not verify.
3. Read the [architecture guide](ARCHITECTURE.md) and the [feature blueprint](FEATURE_BLUEPRINT.md). Use the map below to locate the main subsystems. Confirm current behavior against the checkout, and use the blueprint for intended behavior and acceptance criteria. Treat the verification notes in this handoff as historical.
4. Open the source, guides, and skills relevant to the request before editing. Trace the implementation from its normal entry point, and identify existing components, hooks, and utilities you can reuse. Follow `AGENTS.md` for the local Next.js documentation requirement before writing code.
5. For a context-only request, leave the checkout untouched and summarize what runs, the branch and working tree state, and what is planned or unverified. If the user included a task, proceed with it after loading context.

## Codebase map

| Area                            | Start here                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup, routes, and build      | [App Router](../src/app), [homepage](../src/app/page.tsx), [root layout](../src/app/layout.tsx), [Next.js configuration](../next.config.ts), [npm scripts and dependencies](../package.json)                                                                                                                                                                                 |
| Gallery and catalog data        | [Catalog JSON](../src/data/characters.json) → [asset resolver](../src/data/characters.ts) → [Gallery](../src/components/gallery/gallery.tsx) → [CharacterGrid](../src/components/gallery/character-grid.tsx) → [Thiings Grid](../src/components/gallery/thiings-grid.tsx). The [catalog dialog](../src/components/catalog/character-catalog.tsx) uses the same gallery data. |
| Interactions and sound          | [Mascot](../src/components/mascot/mascot.tsx), [gesture hook](../src/components/mascot/use-mascot-gesture.ts), [shared pointer tracking](../src/components/mascot/page-pointer.ts), [sound hook](../src/hooks/use-reaction-sound.ts), [audio presets and synthesis](../src/lib/audio)                                                                                        |
| Header, dialogs, and appearance | [Header](../src/components/header), [character details](../src/components/character), [resource dialogs](../src/components/resources), [theme provider and switcher](../src/components/theme), [UI primitives](../src/components/ui), [global CSS](../src/app/globals.css), [brand copy](../src/lib/brand.ts), [brand guide](BRAND.md)                                       |
| Asset preparation and delivery  | [Sprite layout](../src/lib/mascot-sprites.ts), [asset scripts](../scripts), [gallery asset guide](GALLERY_ASSETS.md), [licensing](LICENSING.md)                                                                                                                                                                                                                              |
| Deployment and discovery        | [Public origin](../src/lib/site.ts), [metadata and discovery routes](../src/app), [SEO and deployment guide](SEO.md)                                                                                                                                                                                                                                                         |
| Local development and docs      | [Development commands](DEVELOPMENT.md), [guide ownership](DOCUMENTATION.md), [repository skills](../.agents/skills)                                                                                                                                                                                                                                                          |

## Product

AniBoop is an interactive collection of chibi anime mascots. The intended experience is to explore a pannable gallery, boop a character to see it react, and download that character’s direction and reaction sheets. The slogan is **Little characters. Big reactions.** The [brand guide](BRAND.md) and [shared copy](../src/lib/brand.ts) hold the approved wording. The [feature blueprint](FEATURE_BLUEPRINT.md) holds the planned interactions and acceptance criteria.

## What runs today

- The [homepage](../src/app/page.tsx) is a full-screen, pannable gallery populated by the [catalog](../src/data/characters.json). The first catalog entry occupies the center cell, and the catalog repeats in spiral order. Next.js builds the gallery WebPs from `public/mascots/` into content-hashed static URLs with one-year browser caching. Character details ("View & download") and asset downloads are available through the catalog and on each tile via responsive dialogs on desktop and drawers on mobile. Modal overlays use a crisp `bg-black/70` scrim without backdrop blur.
- The [app header](../src/components/header/app-header.tsx) keeps Catalog in reach on narrow screens and moves secondary controls into More options. Ctrl+K or Cmd+K opens the catalog, and the appearance setting persists across visits. Gallery instructions are available to screen readers.
- The header and social preview use the full-color logo. The gallery background repeats the flat wordmark in the active theme, and the purple tap mark supplies browser and launcher icons. See the [brand guide](BRAND.md#logo-and-marks) and [metadata routes](ARCHITECTURE.md#fonts-and-metadata).
- `aniboop.nmrisrl.dev` is the official production origin. `aniboop.vercel.app` is the direct backup for a parent-domain outage. The [SEO guide](SEO.md#production-origin) documents the Vercel build variable and the backup procedure.
- [CharacterGrid](../src/components/gallery/character-grid.tsx) uses the local [Thiings Grid adaptation](../src/components/gallery/thiings-grid.tsx). It derives stable spiral indices and mounts only the visible window plus overscan. Pointer input moves one translated layer via animation frames, and React updates the cell window when needed. Mouse, touch, wheel, trackpad, and arrow keys can pan. Preserve the touch pointer-capture handling and reduced-motion behavior. [Architecture](ARCHITECTURE.md) explains the grid and links to the upstream implementation.
- A shared intersection observer mounts mascot buttons and their 248 × 248 WebP previews as they enter view. An unpressed fine pointer wakes gallery-wide gaze and loads compact direction sheets for visible mascots. A boop, hold, or pinch loads the reaction sheet. Panning pauses gaze tracking, and Tab can reach a mascot when at least half its button is visible. [Gallery loading](GALLERY_ASSETS.md#gallery-loading) documents the delivery behavior.
- Reaction sounds start off on each page load. Enable them with the speaker button or under More options. The gallery plays a synthesized cue for each displayed reaction, including hold and pinch expressions. [Reaction audio](ARCHITECTURE.md#reaction-audio) documents the playback hook and presets.
- The [Mascot component](../src/components/mascot/mascot.tsx) adapts the implementation in `../nmrisrl-v2/components/ui/mascot.tsx` and upstream `page-mascot`. It supports all nine reaction slots, configurable reaction pools, and hold and pinch gestures. The touch handler recognizes taps on release because Chromium can omit the synthesized click after a fast pan.
- The stack is Next.js App Router, React, TypeScript, Tailwind v4, and shadcn’s `radix-nova` style with the unified `radix-ui` dependency. [Global CSS](../src/app/globals.css) defines the light and dark palettes through semantic tokens. Use classes such as `bg-card` and `text-foreground` across themes. Typography is local Allo Bold for headings, Inter Variable for UI, and system monospace. Use `squircle` for adaptive surfaces, or pair `corner-squircle` with an existing fixed `rounded-*` radius. The shared CSS provides a rounded fallback.

## Mascot assets and Git snapshot

Each catalog entry has two local full-size WebP sheets in the Git-ignored `public/mascots/sheets/` folder, a tracked center still in `public/mascots/previews/`, and two tracked compact pose sheets in `public/mascots/gallery-sheets/`. The still and compact sheets share the same framing. Run `git status --short --branch` to check the current working tree and branch.

- To add a mascot, install Pillow and NumPy once with `python -m pip install Pillow numpy`. Put the matching 1080 × 1080 `<id>-directions` and `<id>-reactions` PNG or WebP files in `public/mascots/raw/`, then run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"`. A successful run appends the catalog entry and moves the originals to the Git-ignored `raw/processed/` folder. [Adding a mascot](GALLERY_ASSETS.md#adding-a-mascot) covers the full workflow.
- The sibling `../mascot-maker` project supplied the character metadata. Its catalog includes a fox that is excluded from AniBoop. The sibling `../threadfx` project is the reference for Oxc, editor settings, Tailwind lint, and reusable agent workflows.

## Historical verification

The 139-character gallery passed `npm run lint:all`, `npm run format:check`, and `npm run build`. A Chromium run confirmed that preview, gaze, and boop assets load for all 20 characters in the latest batch. Earlier Chromium checks after the component reorganization covered the compact header down to 320 px, landscape layout, touch and keyboard activation, and focus restoration after closing dialogs.

Earlier framing checks covered the original 16 center previews and 288 playback poses. A batch preview rebuild verified that the generator skips uncataloged source sheets when run against the project's asset directory. Archive checks covered existing destination files and a simulated catalog write failure.

A local production test in a 1440 × 900 Chromium viewport fetched 33 WebPs for opening the gallery, moving the mouse, and booping once. Repeating the visit in the same browser reused all 33 from cache with zero image bytes transferred. Browser checks also covered gaze across cards, drag followed by a touch tap, and keyboard boops with reduced motion. Physical-phone profiling and deployed cache verification remain open.

Repeated mouse boops with slight pointer movement kept neighboring mascots in their last gaze pose during each press. Chromium also verified that a drag still pans and unpressed movement resumes gaze tracking.

## Where to pick up

For gallery changes, start with the [feature blueprint](FEATURE_BLUEPRINT.md) and [gallery asset guide](GALLERY_ASSETS.md#gallery-loading). Keep booping distinct from opening **View & download**. Test tap versus drag, keyboard access, reduced motion, and long pans on a representative phone. Confirm distribution rights and applicable attribution before publishing downloads.

Cloudflare R2 is planned for full-size downloads. The gallery currently serves tracked previews and compact pose sheets. See [Scaling the catalog](GALLERY_ASSETS.md#scaling-the-catalog).

Read [AGENTS.md](../AGENTS.md) before editing. The [development guide](DEVELOPMENT.md) lists setup and checks. Use `npm ci`, `npm run dev`, `npm run lint:all`, and `npm run format:check`. Use `npm run build` for runtime or build changes. Use the [documentation sync skill](../.agents/skills/sync-documentation/SKILL.md) for guide updates and the [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) when asked to publish changes. Commit and push defaults to confirmation. An explicit `--direct` applies only to that invocation.
