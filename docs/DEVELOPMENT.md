# Development

Install the npm lockfile dependencies with `npm ci` and run `npm run dev`.

| Command                | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Run the Next.js development server                   |
| `npm run build`        | Build the app for production                         |
| `npm run start`        | Serve the production build locally                   |
| `npm run lint`         | Run Oxlint with React, TypeScript, and Next.js rules |
| `npm run lint:fix`     | Apply safe Oxlint fixes                              |
| `npm run lint:eslint`  | Run the remaining Next.js ESLint checks              |
| `npm run lint:all`     | Run both linters                                     |
| `npm run format`       | Format project files and sort Tailwind classes       |
| `npm run format:check` | Check formatting                                     |

The [VS Code workspace settings](../.vscode/settings.json) configure Oxfmt on save and point Tailwind IntelliSense at the global stylesheet. The workspace also includes tasks and Next.js debug profiles.

The [commit-and-push skill](../.agents/skills/commit-and-push/SKILL.md) documents the repository workflow for preparing a conventional commit and pushing it.
