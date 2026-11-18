# Documentation maintenance

Update the guide affected by a change. Treat source and configuration as evidence for what the app currently does. Use the feature blueprint for decisions and acceptance criteria about upcoming work.

| When this changes                                          | Update                                                                               | Verify against                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Project summary or quick start                             | [README](../README.md)                                                               | [App Router files](../src/app), [npm scripts](../package.json)                                                         |
| Agent conventions and workflow entry points                | [AGENTS.md](../AGENTS.md)                                                            | Repository configuration and [skills](../.agents/skills)                                                               |
| Application structure, themes, or deployment configuration | [Architecture](ARCHITECTURE.md)                                                      | [App Router files](../src/app), [shadcn configuration](../components.json), [Next.js configuration](../next.config.ts) |
| Product copy, type, or palette                             | [Brand](BRAND.md)                                                                    | [Brand copy](../src/lib/brand.ts), [theme tokens](../src/app/globals.css), [font assets](../src/app/fonts)             |
| Development commands or editor settings                    | [Development](DEVELOPMENT.md)                                                        | [npm scripts](../package.json), [VS Code workspace settings](../.vscode/settings.json)                                 |
| Gallery, reactions, or download behavior                   | [Feature blueprint](FEATURE_BLUEPRINT.md), plus the README if project status changes | Implemented routes, components, and assets                                                                             |
| Gallery rendering, caching, or asset delivery              | [Gallery assets](GALLERY_ASSETS.md)                                                  | Grid implementation, asset pipeline, and mobile performance traces                                                     |

Run [`$sync-documentation`](../.agents/skills/sync-documentation/SKILL.md) to audit and fix drift, or add `--check` for findings only. For a narrow change, name the subsystem or guide in the request. Report any claims that could not be verified.

Keep the framework-managed Next.js rules block in `AGENTS.md` intact. After editing Markdown, verify the affected links and run `npm run format:check`.
