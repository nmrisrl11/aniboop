# AGENTS.md

## Project

AniBoop is a collection of chibi anime characters designed to react when booped. The homepage is a pannable, virtualized grid backed by the [character catalog](src/data/characters.json). Character search, details, and downloads are planned in the [feature blueprint](docs/FEATURE_BLUEPRINT.md).

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

## Corner shapes

- Use `squircle` when a card, banner, or other surface should have corners that scale with its dimensions. The utility supplies both radii in [`globals.css`](src/app/globals.css). Use it on its own so competing radius classes do not override the fallback.
- When a shared component already has a size-specific `rounded-*` radius, add `corner-squircle` to enhance that radius. Use `rounded-full` alone for intentional circles and pills. Preserve keyboard focus indicators on interactive elements.
- Keep the baseline radius outside the feature query and native-only changes inside `@supports (corner-shape: squircle)`. Verify both paths when changing the shared utility.

## Tailwind CSS lint

- Use canonical Tailwind v4 utilities when an equivalent exists, such as `gap-1` for `gap-[4px]`, `data-active:` for `data-[active]:`, and `bg-linear-to-r` for `bg-gradient-to-r`. Use arbitrary values for values with no suitable utility or theme token.
- Resolve conflicting utilities by keeping the one intended for that property and variant. Use explicit variants for differences across breakpoints, states, or data attributes.
- After editing classes or the theme, run `npm run lint:tailwind` and resolve diagnostics introduced by the change, including warnings. Use `npm run lint:tailwind -- --dry-run` to preview automatic fixes. Review any changes made by `npm run lint:tailwind:fix`, format touched files with Oxfmt, and rerun the lint check.

## Documentation and Git

- Keep the affected guides in sync when changing behavior, configuration, commands, or project status. Use the [documentation map](docs/DOCUMENTATION.md) to find the right place and [`$sync-documentation`](.agents/skills/sync-documentation/SKILL.md) for a broader drift audit.
- Use the [commit-and-push skill](.agents/skills/commit-and-push/SKILL.md) when asked to commit and push. It confirms the proposed commit and destination by default, with an explicit `--direct` option.

## Mascot assets

- Place incoming or unoptimized sprite sheets in `public/mascots/raw/`.
- Use `npm run mascot:add` to optimize both sheets, generate the preview, and append the character to the catalog. See [Adding a mascot](docs/GALLERY_ASSETS.md#adding-a-mascot) for the required arguments. Use the [optimize-mascot skill](.agents/skills/optimize-mascot/SKILL.md) for asset-only work.
