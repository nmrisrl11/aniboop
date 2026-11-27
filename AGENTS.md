# AGENTS.md

## Project

AniBoop is a collection of chibi anime characters designed to react when booped. The homepage is a pannable, virtualized grid backed by the [character catalog](src/data/characters.ts) (assembled from per-series JSON files in [`src/data/characters/`](src/data/characters)). The catalog supports searching by name or series and filtering by series, and character details with sprite sheet downloads open from each grid tile or the catalog (see the [feature blueprint](docs/FEATURE_BLUEPRINT.md)).

For a fresh agent conversation, use the [project context workflow](docs/HANDOFF.md) to load the codebase map and check the current checkout.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Setup and checks

- Install dependencies with `npm ci` and start development with `npm run dev`. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.
- Run `npm run lint:all` for Oxlint, Next.js ESLint, and Tailwind CSS lint. Run `npm run format:check` for Oxfmt. Use the production build with `npm run build` to verify changes to routes, application code, or build configuration.
- Prefer formatting only the files you changed. See the [development guide](docs/DEVELOPMENT.md) for the full command list.

## Code and design

- Use TypeScript and the configured `@/` alias for imports across `src/`. Keep App Router pages and layouts as Server Components by default. Put browser state and event handling in the Client Components that need them.
- Use the [shadcn skill](.agents/skills/shadcn/SKILL.md) when adding or composing shadcn components. Reuse the Radix primitives in [`src/components/ui`](src/components/ui). Keep both palettes in [`globals.css`](src/app/globals.css) and use semantic utilities such as `bg-card` and `text-foreground` across themes.
- Update shared product copy in [`src/lib/brand.ts`](src/lib/brand.ts). Use Allo Bold for display type, Inter for UI text, and system monospace for technical values. See the [brand guide](docs/BRAND.md) for typography, palette, and voice.
- Keep boop activation and opening character details distinct when implementing the gallery. Preserve keyboard access and reduced-motion behavior. Review the [feature blueprint](docs/FEATURE_BLUEPRINT.md) for acceptance criteria.

## Icon usage

- Always import icons directly from `lucide-react` with their canonical `*Icon` suffix (e.g. `HomeIcon`, `SearchIcon`, `XIcon`, `CheckIcon`, `ChevronRightIcon`).
- Never import icons using their base un-suffixed name (e.g. `import { Home }`), and never use rename aliases (e.g. `import { Home as HomeIcon }` or `import { Check as CheckIcon }`). Import the canonical `HomeIcon` or `CheckIcon` directly from `lucide-react`.
- When typing Lucide icon components or props, import `type LucideIcon` from `lucide-react`.
- When adding or generating components from shadcn/ui or external sources, audit generated icon imports and update them to use direct suffixed `*Icon` exports before committing.

## Corner shapes

- Always pair a baseline circular fallback (`rounded-*`) with `corner-squircle` (from `@toolwind/corner-shape`) and a scaled-up `squircle:rounded-*` utility via the `@custom-variant squircle` feature query (`@supports (corner-shape: squircle)`) in [`globals.css`](src/app/globals.css). Never ship bare `rounded-* corner-squircle` without a `squircle:` radius bump (because `superellipse(2)` cuts ~46% less corner area and looks sharper than the circular fallback), and never raise the unconditional fallback radius just to compensate for squircle softness.
- Rely on the shared primitives in [`src/components/ui`](src/components/ui) for default corner-shape pairs instead of duplicating `corner-squircle` on callers. Follow the balanced radius ladder (`rounded-lg` → `squircle:rounded-2xl` on controls/inputs/buttons, `rounded-md` / compact `sm` / `xs` → `squircle:rounded-xl`, `rounded-xl` → `squircle:rounded-3xl` on cards/menus/popovers/code blocks, `rounded-2xl` → `squircle:rounded-[32px]` on dialogs and directional edges on drawers, `rounded-3xl` → `squircle:rounded-[44px]` on gallery tiles).
- Use `squircle:rounded-full` only on square (`1:1`) icon boxes, portrait frames, or compact square controls — never on rectangular cards, dialogs, or full-width buttons where `rounded-full` distorts corners into an oval/pill. Keep bare `rounded-full` (without `corner-squircle`) for intentional circles, status badges, and pills.
- Align nested inner and outer radii concentrically for both fallback (`outer - gap`) and native squircle (`outer - ~1.84 × gap`), e.g. a `rounded-xl p-1 squircle:rounded-3xl` parent with a `rounded-lg squircle:rounded-xl` child, or a `rounded-xl p-1.5 squircle:rounded-3xl` menu with `rounded-md squircle:rounded-xl` items.
- When adding or updating shadcn/ui components, audit generated `rounded-*` classes to apply the triad above, preserve keyboard focus indicators, keep fallback radii outside `@supports`, and verify both fallback and native `corner-shape: squircle` paths. See [Corner-shape conventions](docs/DEVELOPMENT.md#corner-shape-conventions) and [Brand corner shapes](docs/BRAND.md#corner-shapes).

## Tailwind CSS lint

- Use canonical Tailwind v4 utilities when an equivalent exists, such as `gap-1` for `gap-[4px]`, `data-active:` for `data-[active]:`, and `bg-linear-to-r` for `bg-gradient-to-r`. Use arbitrary values for values with no suitable utility or theme token.
- Resolve conflicting utilities by keeping the one intended for that property and variant. Use explicit variants for differences across breakpoints, states, or data attributes.
- After editing classes or the theme, run `npm run lint:tailwind` and resolve diagnostics introduced by the change, including warnings. Use `npm run lint:tailwind -- --dry-run` to preview automatic fixes. Review any changes made by `npm run lint:tailwind:fix`, format touched files with Oxfmt, and rerun the lint check.

## Documentation and Git

- Keep the affected guides in sync when changing behavior, configuration, commands, or project status. Use the [documentation map](docs/DOCUMENTATION.md) to find the right place and [`$sync-documentation`](.agents/skills/sync-documentation/SKILL.md) for a broader drift audit.
- Use the [commit-and-push skill](.agents/skills/commit-and-push/SKILL.md) when asked to commit and push. It confirms the proposed commit and destination by default, with an explicit `--direct` option.

## Mascot assets

- Place incoming or unoptimized sprite sheets in `public/mascots/raw/`.
- Use `npm run mascot:add` to optimize both sheets, generate the preview and compact pose sheets, upload all five WebPs (`previews/`, `gallery-sheets/`, `sheets/`) to Cloudflare R2 first, record the character's content hash (`v`) in its series file under `src/data/characters/`, and archive originals to `public/mascots/raw/processed/`.
- Use `npm run mascot:update -- --id <id>` to replace an existing character's artwork, upload all five updated WebPs to Cloudflare R2 first, back up local copies to `public/old-version/mascots/`, and refresh its `v` cache-busting hash. Avoid using `--skip-r2` while `next dev` is open against live R2 (sync to R2 before loading the page) so Cloudflare never caches previous artwork or 404s under a new immutable `?v=<hash>`. See [Adding a mascot](docs/GALLERY_ASSETS.md#adding-a-mascot), [Cloudflare R2 storage](docs/R2_STORAGE.md), and the [optimize-mascot skill](.agents/skills/optimize-mascot/SKILL.md).
- After catalog changes, refresh the [README](README.md) character and series totals from the catalog and check any affected featured previews. When updating a character featured in `README.md`, include `?v=<new_hash>` on its image URL so Cloudflare and GitHub's image proxy fetch the updated preview. Include the README update with the catalog change.
- All generated mascot assets (`public/mascots/previews/`, `public/mascots/gallery-sheets/`, and `public/mascots/sheets/`) are Git-ignored and served from Cloudflare R2 (`NEXT_PUBLIC_R2_ASSETS_URL`) with `?v=<hash>` cache busting.
