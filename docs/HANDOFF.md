# AniBoop conversation handoff

Open the AniBoop workspace and paste this into the new conversation.

> Read `docs/HANDOFF.md` and `AGENTS.md`, check the current Git status, then use that context for my next request.

## Product

AniBoop is an interactive collection of chibi anime mascots. The intended experience is to explore a pannable gallery, boop a character to see it react, and download that character’s direction and reaction sheets. The slogan is **Little characters. Big reactions.** The [brand guide](BRAND.md) and [shared copy](../src/lib/brand.ts) hold the approved wording. The [feature blueprint](FEATURE_BLUEPRINT.md) holds the planned interactions and acceptance criteria.

## What runs today

- The [homepage](../src/app/page.tsx) is a full-screen, pannable gallery populated by the [catalog](../src/data/characters.json). Nomer occupies the center cell, and the catalog repeats in spiral order. Asset URLs are derived from each character ID and served from `public/mascots/`. Search, details, and downloads are pending.
- [CharacterGrid](../src/components/gallery/character-grid.tsx) uses the local [Thiings Grid adaptation](../src/components/gallery/thiings-grid.tsx). It derives stable spiral indices and mounts only the visible window plus overscan. Pointer input moves one translated layer via animation frames, and React updates the cell window when needed. Mouse, touch, wheel, trackpad, and arrow keys can pan. Preserve the touch pointer-capture handling and reduced-motion behavior. [Architecture](ARCHITECTURE.md) explains the grid and links to the upstream implementation.
- A shared intersection observer mounts mascot buttons and their 248 × 248 WebP previews as they enter view. A deliberate hover near the button edge loads the direction sheet. A boop, hold, or pinch loads the reaction sheet. Panning pauses gaze tracking, and Tab can reach a mascot when at least half its button is visible. [Gallery loading](GALLERY_ASSETS.md#gallery-loading) documents the delivery behavior.
- The [Mascot component](../src/components/mascot/mascot.tsx) adapts the implementation in `../nmrisrl-v2/components/ui/mascot.tsx` and upstream `page-mascot`. It supports all nine reaction slots, configurable reaction pools, and hold and pinch gestures. Feedback is visual, with one gallery hint. The touch handler recognizes taps on release because Chromium can omit the synthesized click after a fast pan.
- The stack is Next.js App Router, React, TypeScript, Tailwind v4, and shadcn’s `radix-nova` style with the unified `radix-ui` dependency. [Global CSS](../src/app/globals.css) defines light and system-dark palettes through semantic tokens. Use classes such as `bg-card` and `text-foreground` without per-component `dark:` overrides. Typography is local Allo Bold for headings, Inter Variable for UI, and system monospace. Use `squircle` for adaptive surfaces, or pair `corner-squircle` with an existing fixed `rounded-*` radius. The shared CSS provides a rounded fallback.

## Mascot assets and Git snapshot

Each catalog entry uses two WebP sheets in `public/mascots/sheets/` and one WebP preview in `public/mascots/previews/`. Run `git status --short --branch` to check the current working tree and branch.

- Run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"` to validate the raw pair, optimize the sheets, generate the preview, and append the catalog entry. [Adding a mascot](GALLERY_ASSETS.md#adding-a-mascot) covers setup and naming.
- The sibling `../mascot-maker` project supplied the character metadata. Its catalog includes a fox that is excluded from AniBoop. The sibling `../threadfx` project is the reference for Oxc, editor settings, Tailwind lint, and reusable agent workflows.

## Last verification

The gallery integration passed `npm run lint:all`, `npm run format:check`, and `npm run build`. A cold 390 × 540 Chromium viewport fetched nine previews totaling about 90 KiB and zero full sheets. A drag fetched three newly visible previews, and panning back reused the original images. Browser checks covered mouse and keyboard input, distant pans, and emulated touch taps after fast drags, pinches, and reduced motion. Physical-phone profiling remains open.

## Where to pick up

For gallery changes, start with the [feature blueprint](FEATURE_BLUEPRINT.md) and [gallery asset guide](GALLERY_ASSETS.md#gallery-loading). Keep booping distinct from opening **View & download**. Test tap versus drag, keyboard access, reduced motion, and long pans on a representative phone. Confirm distribution rights and applicable attribution before publishing downloads.

The desired desktop behavior is for all visible mascots to follow the cursor across the gallery. The [proposed approach](GALLERY_ASSETS.md#proposed-gallery-wide-cursor-tracking) uses smaller nine-pose sheets. The current implementation tracks on individual button hover.

Cloudflare R2 with a custom domain and versioned asset paths is a future option. The current integration serves local files and keeps metadata in the repository. See [Scaling the catalog](GALLERY_ASSETS.md#scaling-the-catalog).

Read [AGENTS.md](../AGENTS.md) before editing. The [development guide](DEVELOPMENT.md) lists setup and checks. Use `npm ci`, `npm run dev`, `npm run lint:all`, and `npm run format:check`. Use `npm run build` for runtime or build changes. Use the [documentation sync skill](../.agents/skills/sync-documentation/SKILL.md) for guide updates and the [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) when asked to publish changes. Commit and push defaults to confirmation. An explicit `--direct` applies only to that invocation.
