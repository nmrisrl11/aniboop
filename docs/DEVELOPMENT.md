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
| `npm run mascot:add`        | Generate five WebPs, add the mascot, and archive the original pair. |

The [VS Code workspace settings](../.vscode/settings.json) configure Oxfmt on save and point Tailwind IntelliSense at the global stylesheet. The workspace also includes tasks and Next.js debug profiles.

Tailwind lint uses [`src/app/globals.css`](../src/app/globals.css) and checks source under `src/`. The CLI and IntelliSense share class extraction settings for `className`, `cn`, `clsx`, and `cva`. Canonical class suggestions and conflicts are warnings by default. Review these even when the command exits successfully. Preview available fixes with `npm run lint:tailwind -- --dry-run`. Oxfmt handles class ordering. See [Tailwind CSS lint rules](../AGENTS.md#tailwind-css-lint) for the project conventions.

The [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) documents the repository workflow for preparing a conventional commit and pushing it.

## Environment variables

Copy `.env.example` to `.env.local` to customize settings during local development.

| Variable                    | Scope            | Purpose                                                                                                                                                             | Default / Fallback                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `ANIBOOP_URL`               | Build / Server   | Official public URL (e.g. `https://aniboop.nmrisrl.dev`). Required in production builds for canonical metadata, sitemap generation, and search engine indexability. | Unset in local dev and preview builds (`noindex, follow`).                 |
| `NEXT_PUBLIC_R2_ASSETS_URL` | Client / Browser | Base public origin for Cloudflare R2 holding full-size 1080 × 1080 master sheets (e.g. `https://assets.aniboop.nmrisrl.dev` or public R2 URL).                      | When unset, HD downloads fall back to local compact sheets without errors. |

See the [SEO and site discovery guide](SEO.md) for domain verification and the [gallery assets guide](GALLERY_ASSETS.md#scaling-the-catalog) for Cloudflare R2 details.

The [gallery assets guide](GALLERY_ASSETS.md#adding-a-mascot) covers Python requirements, adding a mascot, and regenerating individual assets.
