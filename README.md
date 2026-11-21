# AniBoop

**Little characters. Big reactions.**

Explore **119 chibi characters across 20 anime series** in an endless, pannable gallery. Move your cursor to see them look back, or boop one for a reaction.

## Featured characters

<p>
  <img src="public/mascots/previews/naruto.webp" alt="Naruto Uzumaki" width="88">
  <img src="public/mascots/previews/luffy.webp" alt="Monkey D. Luffy" width="88">
  <img src="public/mascots/previews/goku.webp" alt="Son Goku" width="88">
  <img src="public/mascots/previews/midoriya.webp" alt="Izuku Midoriya (Deku)" width="88">
  <img src="public/mascots/previews/asta.webp" alt="Asta" width="88">
</p>

<p>
  <img src="public/mascots/previews/eren.webp" alt="Eren Yeager" width="88">
  <img src="public/mascots/previews/lelouch.webp" alt="Lelouch vi Britannia" width="88">
  <img src="public/mascots/previews/saitama.webp" alt="Saitama" width="88">
  <img src="public/mascots/previews/jinwoo.webp" alt="Sung Jinwoo" width="88">
  <img src="public/mascots/previews/kaneki.webp" alt="Ken Kaneki" width="88">
</p>

## Explore the gallery

- **Pan** by dragging, scrolling, or using the arrow keys while the gallery is focused.
- **Boop** by clicking, tapping, or pressing Enter or Space on a focused character. Hold or use a two-finger pinch for a different reaction. Boop order offers **In order**, **Random**, and **Build up**.
- **Find a character** in Catalog. Search by name or series, or filter by series. Press **Ctrl+K** or **Cmd+K** to open it. The [catalog data](src/data/characters.json) drives both the dialog and the grid.
- **Use More options** on smaller screens for boop order, appearance, the component guide, credits, and the GitHub link. Appearance supports System, Light, and Dark.

Character details and asset downloads are planned. See the [feature blueprint](docs/FEATURE_BLUEPRINT.md).

## Get started

Use **Node.js 22.12 or later** and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run `npm run lint:all` and `npm run format:check` for code checks, or `npm run build` for a production build.

## Tech stack

| Area          | Stack                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| App           | Next.js 16 App Router, React 19, TypeScript, and Turbopack               |
| Interface     | Tailwind CSS 4, shadcn/ui with Radix primitives, Lucide, and next-themes |
| Code examples | shadcn Code Block with Shiki syntax highlighting                         |
| Code quality  | Oxlint, Next.js ESLint, Tailwind CSS lint, and Oxfmt                     |
| Mascot assets | WebP sprite sheets with Python, Pillow, and NumPy for asset preparation  |

## Documentation

| Guide                                              | Contents                                         |
| -------------------------------------------------- | ------------------------------------------------ |
| [Brand](docs/BRAND.md)                             | Product copy, typography, palette, and identity  |
| [Architecture](docs/ARCHITECTURE.md)               | App Router, theme tokens, assets, and metadata   |
| [Feature blueprint](docs/FEATURE_BLUEPRINT.md)     | Gallery, mascot reactions, and downloads         |
| [Gallery assets](docs/GALLERY_ASSETS.md)           | Sprite sheets, gallery loading, and mascot setup |
| [Development](docs/DEVELOPMENT.md)                 | Build, lint, formatting, and editor setup        |
| [Documentation maintenance](docs/DOCUMENTATION.md) | Guide ownership and documentation sync workflow  |
| [Agent instructions](AGENTS.md)                    | Repository-specific agent guidance               |

## Credits

The pannable grid adapts [Thiings Grid](https://github.com/charlieclark/thiings-grid) by Charlie Clark. The mascot interactions build on [page-mascot](https://github.com/nilbuild/page-mascot) by Kamran Ahmed. Anime characters belong to their original creators and studios.
