# AniBoop conversation handoff

Open the AniBoop workspace and paste this into the new conversation.

> Read `docs/HANDOFF.md` and `AGENTS.md`, check the current Git status, then use that context for my next request.

## Product

AniBoop is an interactive collection of chibi anime mascots. The intended experience is to explore a pannable gallery, boop a character to see it react, and download that character’s direction and reaction sheets. The slogan is **Little characters. Big reactions.** The [brand guide](BRAND.md) and [shared copy](../src/lib/brand.ts) hold the approved wording. The [feature blueprint](FEATURE_BLUEPRINT.md) holds the planned interactions and acceptance criteria.

## What runs today

- The [homepage](../src/app/page.tsx) is a full-screen, pannable gallery populated by the [catalog](../src/data/characters.json). The first catalog entry occupies the center cell, and the catalog repeats in spiral order. Next.js builds the gallery WebPs from `public/mascots/` into content-hashed static URLs with one-year browser caching. Character details and downloads are pending.
- The [app header](../src/components/app-header.tsx) composes the boop order and appearance controls, component guide, credits, GitHub repository link, and searchable catalog. Ctrl+K or Cmd+K opens the catalog, and the appearance setting persists across visits. Gallery instructions are available to screen readers.
- [CharacterGrid](../src/components/gallery/character-grid.tsx) uses the local [Thiings Grid adaptation](../src/components/gallery/thiings-grid.tsx). It derives stable spiral indices and mounts only the visible window plus overscan. Pointer input moves one translated layer via animation frames, and React updates the cell window when needed. Mouse, touch, wheel, trackpad, and arrow keys can pan. Preserve the touch pointer-capture handling and reduced-motion behavior. [Architecture](ARCHITECTURE.md) explains the grid and links to the upstream implementation.
- A shared intersection observer mounts mascot buttons and their 248 × 248 WebP previews as they enter view. An unpressed fine pointer wakes gallery-wide gaze and loads compact direction sheets for visible mascots. A boop, hold, or pinch loads the reaction sheet. Panning pauses gaze tracking, and Tab can reach a mascot when at least half its button is visible. [Gallery loading](GALLERY_ASSETS.md#gallery-loading) documents the delivery behavior.
- The [Mascot component](../src/components/mascot/mascot.tsx) adapts the implementation in `../nmrisrl-v2/components/ui/mascot.tsx` and upstream `page-mascot`. It supports all nine reaction slots, configurable reaction pools, and hold and pinch gestures. The touch handler recognizes taps on release because Chromium can omit the synthesized click after a fast pan.
- The stack is Next.js App Router, React, TypeScript, Tailwind v4, and shadcn’s `radix-nova` style with the unified `radix-ui` dependency. [Global CSS](../src/app/globals.css) defines the light and dark palettes through semantic tokens. Use classes such as `bg-card` and `text-foreground` across themes. Typography is local Allo Bold for headings, Inter Variable for UI, and system monospace. Use `squircle` for adaptive surfaces, or pair `corner-squircle` with an existing fixed `rounded-*` radius. The shared CSS provides a rounded fallback.

## Mascot assets and Git snapshot

Each catalog entry uses two full-size WebP sheets in `public/mascots/sheets/`, a center still in `public/mascots/previews/`, and two compact pose sheets in `public/mascots/gallery-sheets/`. The still and compact sheets share the same framing. Run `git status --short --branch` to check the current working tree and branch.

- To add a mascot, install Pillow and NumPy once with `python -m pip install Pillow numpy`. Put the matching 1080 × 1080 `<id>-directions` and `<id>-reactions` PNG or WebP files in `public/mascots/raw/`, then run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"`. A successful run appends the catalog entry and moves the originals to the Git-ignored `raw/processed/` folder. [Adding a mascot](GALLERY_ASSETS.md#adding-a-mascot) covers the full workflow.
- The sibling `../mascot-maker` project supplied the character metadata. Its catalog includes a fox that is excluded from AniBoop. The sibling `../threadfx` project is the reference for Oxc, editor settings, Tailwind lint, and reusable agent workflows.

## Last verification

The 119-character gallery passed `npm run lint:all`, `npm run format:check`, and `npm run build` after the latest batch. Browser checks confirmed that previews, gaze poses, and boop reactions load for all 19 additions and eight replacements. Earlier archive checks covered existing destination files and a simulated catalog write failure.

Earlier framing checks covered the original 16 center previews and 288 playback poses. A batch preview rebuild verified that the generator skips uncataloged source sheets when run against the project's asset directory.

A local production test in a 1440 × 900 Chromium viewport fetched 33 WebPs for opening the gallery, moving the mouse, and booping once. Repeating the visit in the same browser reused all 33 from cache with zero image bytes transferred. Browser checks also covered gaze across cards, drag followed by a touch tap, and keyboard boops with reduced motion. Physical-phone profiling and deployed cache verification remain open.

Repeated mouse boops with slight pointer movement kept neighboring mascots in their last gaze pose during each press. Chromium also verified that a drag still pans and unpressed movement resumes gaze tracking.

## Where to pick up

For gallery changes, start with the [feature blueprint](FEATURE_BLUEPRINT.md) and [gallery asset guide](GALLERY_ASSETS.md#gallery-loading). Keep booping distinct from opening **View & download**. Test tap versus drag, keyboard access, reduced motion, and long pans on a representative phone. Confirm distribution rights and applicable attribution before publishing downloads.

Cloudflare R2 with a custom domain and versioned asset paths is a future option. The current integration serves local files and keeps metadata in the repository. See [Scaling the catalog](GALLERY_ASSETS.md#scaling-the-catalog).

Read [AGENTS.md](../AGENTS.md) before editing. The [development guide](DEVELOPMENT.md) lists setup and checks. Use `npm ci`, `npm run dev`, `npm run lint:all`, and `npm run format:check`. Use `npm run build` for runtime or build changes. Use the [documentation sync skill](../.agents/skills/sync-documentation/SKILL.md) for guide updates and the [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) when asked to publish changes. Commit and push defaults to confirmation. An explicit `--direct` applies only to that invocation.
