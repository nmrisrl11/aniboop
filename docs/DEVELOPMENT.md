# Development

Use Node.js 22.12 or later and npm. Install the lockfile dependencies with `npm ci`, then run `npm run dev`. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

| Command                     | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `npm run dev`               | Run the Next.js development server                                  |
| `npm run build`             | Build the app for production                                        |
| `npm run start`             | Serve the production build locally                                  |
| `npm run lint`              | Run Oxlint with React, TypeScript, and Next.js rules                |
| `npm run lint:fix`          | Apply safe Oxlint fixes                                             |
| `npm run lint:eslint`       | Run the remaining Next.js ESLint checks                             |
| `npm run lint:all`          | Run Oxlint, Next.js ESLint, and Tailwind CSS lint                   |
| `npm run lint:tailwind`     | Check Tailwind utilities against the app theme                      |
| `npm run lint:tailwind:fix` | Apply available Tailwind CSS lint fixes                             |
| `npm run format`            | Format project files and sort Tailwind classes                      |
| `npm run format:check`      | Check formatting                                                    |
| `npm run mascot:optimize`   | Optimize raw mascot sprite sheets in `public/mascots/raw`           |
| `npm run mascot:add`        | Generate five WebPs, add the mascot, archive originals, and sync R2 |
| `npm run mascot:sync-r2`    | Sync or audit 1080 master sheets with Cloudflare R2 storage         |

The [VS Code workspace settings](../.vscode/settings.json) configure Oxfmt on save and point Tailwind IntelliSense at the global stylesheet. The workspace also includes tasks and Next.js debug profiles.

Tailwind lint uses [`src/app/globals.css`](../src/app/globals.css) and checks source under `src/`. The CLI and IntelliSense share class extraction settings for `className`, `cn`, `clsx`, and `cva`. Canonical class suggestions and conflicts are warnings by default. Review these even when the command exits successfully. Preview available fixes with `npm run lint:tailwind -- --dry-run`. Oxfmt handles class ordering. See [Tailwind CSS lint rules](../AGENTS.md#tailwind-css-lint) for the project conventions.

The [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) documents the repository workflow for preparing a conventional commit and pushing it.

## Icon conventions

Icons are provided by `lucide-react`. Follow these conventions across all components:

- **Canonical `*Icon` exports**: Import icons directly using the `Icon` suffix (e.g. `import { HomeIcon, SearchIcon, CheckIcon } from "lucide-react"`).
- **No import aliases**: Do not use import renaming aliases such as `import { Home as HomeIcon }` or `import { Check as CheckIcon }`. Lucide React exports canonical `*Icon` variants directly; always import those directly instead.
- **No unsuffixed icon imports**: Avoid importing bare icon names such as `Home` or `Search` to prevent naming collisions with domain models or components and maintain consistent symbol naming throughout the codebase.
- **Type annotations**: Use `type LucideIcon` imported directly from `lucide-react` when passing icon components as props or defining icon maps.
- **Third-party component additions**: When adding or updating shadcn components, inspect the imports and update any generated unsuffixed icon imports to match this rule.

## Corner-shape conventions

Squircle corners are provided by `@toolwind/corner-shape` paired with the `@custom-variant squircle` feature query (`@supports (corner-shape: squircle)`) in [`src/app/globals.css`](../src/app/globals.css). Because CSS `corner-shape: squircle` (`superellipse(2)`) cuts ~46% less off each corner than a circular arc of the same radius, follow these rules across all surfaces:

- **Use the fallback + shape + bump triad**: Always combine a baseline `rounded-*` fallback, `corner-squircle`, and a scaled-up `squircle:rounded-*` utility (`~1.6×–2×` larger). Do not leave bare `rounded-* corner-squircle` without a `squircle:` bump, and do not inflate the baseline `rounded-*` fallback to look right only in Chromium.
- **Follow the balanced radius scale**:
  - Controls, inputs, and default buttons: `rounded-lg corner-squircle squircle:rounded-2xl` (compact `sm` / `xs` controls: `squircle:rounded-xl`)
  - Cards, menus, popovers, tab lists, and code blocks: `rounded-xl corner-squircle squircle:rounded-3xl`
  - Dialogs and drawers: `rounded-2xl corner-squircle squircle:rounded-[32px]` (use directional utilities such as `rounded-t-2xl squircle:rounded-t-[32px]` on drawers)
  - Gallery tiles: `rounded-3xl corner-squircle squircle:rounded-[44px]`
  - Square (`1:1`) icon containers, portrait frames, and compact square corner buttons: `rounded-lg` or `rounded-2xl` paired with `corner-squircle squircle:rounded-full`
- **Keep `squircle:rounded-full` strictly for `1:1` squares**: Never apply `squircle:rounded-full` to rectangular cards, dialogs, or full-width buttons. Keep plain `rounded-full` (without `corner-squircle`) for intentional circles, status badges, and pills.
- **Reuse primitive defaults**: Shared primitives in [`src/components/ui`](../src/components/ui) (`Button`, `CodeBlock`, `Dialog`, `Drawer`, `DropdownMenu`, `Input`, `Popover`, `Select`, `Tabs`) already include `corner-squircle` and default `squircle:rounded-*` radii; avoid repeating `corner-squircle` on callers unless overriding a radius.
- **Match concentric nesting**: Subtract padding on nested pairs for both fallback (`outer - gap`) and native squircle (`outer - ~1.84 × gap`), e.g. `rounded-xl p-1 squircle:rounded-3xl` wrapping `rounded-lg squircle:rounded-xl`, or `rounded-xl p-1.5 squircle:rounded-3xl` wrapping `rounded-md squircle:rounded-xl`.
- **Third-party component additions**: When adding or updating shadcn/ui components, audit generated `rounded-*` classes and add `corner-squircle` + `squircle:rounded-*` before committing.

See [Corner shapes in the brand guide](BRAND.md#corner-shapes) and [AGENTS.md](../AGENTS.md#corner-shapes) for reference.

## Environment variables

Copy `.env.example` to `.env.local` to customize settings during local development.

| Variable                    | Scope            | Purpose                                                                                                                                                             | Default / Fallback                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `ANIBOOP_URL`               | Build / Server   | Official public URL (e.g. `https://aniboop.nmrisrl.dev`). Required in production builds for canonical metadata, sitemap generation, and search engine indexability. | Unset in local dev and preview builds (`noindex, follow`).                 |
| `NEXT_PUBLIC_R2_ASSETS_URL` | Client / Browser | Base public origin for Cloudflare R2 holding full-size 1080 × 1080 master sheets (e.g. `https://aniboop-assets.nmrisrl.dev` or public R2 URL).                      | When unset, HD downloads fall back to local compact sheets without errors. |

See the [SEO and site discovery guide](SEO.md) for domain verification and the [R2 storage guide](R2_STORAGE.md) for Cloudflare R2 setup, CORS, and sync workflows.

The [gallery assets guide](GALLERY_ASSETS.md#adding-a-mascot) covers Python requirements, adding a mascot, and regenerating individual assets.
