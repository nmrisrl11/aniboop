# Architecture

| Area                                       | Location                                        |
| ------------------------------------------ | ----------------------------------------------- |
| App Router and homepage                    | [`src/app`](../src/app)                         |
| Shared brand copy                          | [`src/lib/brand.ts`](../src/lib/brand.ts)       |
| Tailwind v4 theme and shadcn CSS variables | [`src/app/globals.css`](../src/app/globals.css) |
| shadcn Radix Nova configuration            | [`components.json`](../components.json)         |
| shadcn component source                    | [`src/components/ui`](../src/components/ui)     |

## Theme

The root layout uses `next-themes` with class-based themes and a system default. The theme selector offers System, Light, and Dark. The provider persists the selection and watches for system preference changes when System is selected.

Light values live in `:root` and dark overrides live in `.dark`. Tailwind exposes these through `@theme inline`. Use semantic utilities such as `bg-card`, `text-foreground`, and `border-input` so both palettes resolve from the same component code.

## Fonts and metadata

The root layout loads Allo Bold and the upright Latin subset of Inter Variable through `next/font/local`. Both are served from the app with `font-display: swap` and global preloading disabled. Use `font-heading font-bold` for display type, `font-sans` for interface text, and `font-mono` for technical values that benefit from a system monospace face.

Next.js derives favicon and social image routes from `icon.svg` and `opengraph-image.tsx`. Set `ANIBOOP_URL` to the public origin at build time when deploying so metadata resolves share images against the correct host.
