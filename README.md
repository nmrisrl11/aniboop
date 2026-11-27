# <img src="public/brand/aniboop-logo.svg" alt="AniBoop" width="216" height="60">

**Little characters. Big reactions.**

Explore **190 chibi characters across 26 anime series** in an endless, pannable gallery. Move your cursor to see them look back, or boop one for a reaction.

[Open AniBoop](https://aniboop.nmrisrl.dev) at its official address. If the official domain is unavailable, open [aniboop.vercel.app](https://aniboop.vercel.app) directly. See the [domain and outage guide](docs/SEO.md#backup-access-on-vercel) for recovery steps.

## Featured characters

<p>
  <img src="https://aniboop-assets.nmrisrl.dev/previews/naruto.webp?v=4b8a459d" alt="Naruto Uzumaki" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/luffy.webp?v=92fe2b0e" alt="Monkey D. Luffy" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/goku.webp?v=2e74c5c6" alt="Son Goku" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/midoriya.webp?v=b7d06547" alt="Izuku Midoriya (Deku)" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/asta.webp?v=279039ee" alt="Asta" width="88">
</p>

<p>
  <img src="https://aniboop-assets.nmrisrl.dev/previews/eren.webp?v=a06964c4" alt="Eren Yeager" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/lelouch.webp?v=6ff805e3" alt="Lelouch vi Britannia" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/saitama.webp?v=3e54f6fb" alt="Saitama" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/jinwoo.webp?v=e9a4063f" alt="Sung Jinwoo" width="88">
  <img src="https://aniboop-assets.nmrisrl.dev/previews/kaneki.webp?v=1d042a65" alt="Ken Kaneki" width="88">
</p>

## Explore the gallery

- **Pan** by dragging, scrolling, or using the arrow keys while the gallery is focused.
- **Boop** by clicking, tapping, or pressing Enter or Space on a focused character. Hold or use a two-finger pinch for a different reaction. Boop order offers **In order**, **Random**, and **Build up** (persisted across visits).
- **Turn on Reaction sounds** with the speaker button or under More options on smaller screens. Each expression has its own sound, including during holds and pinches.
- **Filter the live grid by series** using the floating bottom dock (**All series** or any of the 26 anime series). Selecting a series updates the URL (`/?series=<slug>`) with browser Back/Forward support and includes a one-click clear button.
- **Find a character** in Catalog. Search by name or series, or filter by series. Press **Ctrl+K** or **Cmd+K** to open it. The [catalog data](src/data/characters) drives both the responsive catalog (dialog on desktop, drawer on mobile) and the grid.
- **Use More options** on smaller screens for boop order, appearance, the Playground, the component guide, credits, and Support links (GitHub Repository, Buy Me a Coffee, and Upvote on AppBuildersPH). Appearance supports System, Light, and Dark.

- **View details & download assets** by clicking the card action on any tile or choosing a character from the Catalog. Download high-resolution master sheets (1080 × 1080) or lightweight web-ready sheets (504 × 504) for directional gazes and emotional reactions — delivered via Cloudflare R2 — in an adaptive dialog on desktop and an ergonomic bottom-sheet drawer on mobile. Each detail modal updates the URL (`/?character=<id>`) for browser Back/Forward navigation and includes **Try in Playground** and **Copy link** actions in the footer.
- **Test custom sheets** in the [Playground](https://aniboop.nmrisrl.dev/playground) (`/playground`). Drag and drop your own 3 × 3 Directions and Reactions sprite sheets locally in the browser — or pick any character from the catalog (or open `/playground?character=<id>`) — to preview gaze tracking, boops, and reaction sounds.

## Get started

Use **Node.js 22.12 or later** and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run `npm run lint:all` and `npm run format:check` for code checks, or `npm run build` for a production build.

## Tech stack

| Area          | Stack                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| App           | Next.js 16 App Router, React 19, TypeScript, Turbopack, nuqs, and Vercel Analytics |
| Interface     | Tailwind CSS 4, shadcn/ui with Radix primitives & Vaul drawer, Lucide, next-themes |
| Code examples | shadcn Code Block with Shiki syntax highlighting                                   |
| Code quality  | Oxlint, Next.js ESLint, Tailwind CSS lint, and Oxfmt                               |
| Mascot assets | WebP sprite sheets with Python, Pillow, NumPy, and Cloudflare R2                   |

## Documentation

| Guide                                              | Contents                                              |
| -------------------------------------------------- | ----------------------------------------------------- |
| [Brand](docs/BRAND.md)                             | Product copy, typography, palette, and identity       |
| [Architecture](docs/ARCHITECTURE.md)               | App Router, theme tokens, assets, and metadata        |
| [SEO and site discovery](docs/SEO.md)              | Metadata, production origin, and crawler endpoints    |
| [Feature blueprint](docs/FEATURE_BLUEPRINT.md)     | Gallery, mascot reactions, and downloads              |
| [Gallery assets](docs/GALLERY_ASSETS.md)           | Sprite sheets, gallery loading, and mascot setup      |
| [Cloudflare R2 storage](docs/R2_STORAGE.md)        | HD master sheet offloading, sync CLI, and CORS        |
| [Development](docs/DEVELOPMENT.md)                 | Build, lint, formatting, and editor setup             |
| [Documentation maintenance](docs/DOCUMENTATION.md) | Guide ownership and documentation sync workflow       |
| [Agent instructions](AGENTS.md)                    | Repository-specific agent guidance                    |
| [Load project context](docs/HANDOFF.md)            | Startup workflow and codebase map for new agent chats |

## Credits

The pannable grid adapts [Thiings Grid](https://github.com/charlieclark/thiings-grid) by Charlie Clark. The mascot interactions build on [page-mascot](https://github.com/nilbuild/page-mascot) by Kamran Ahmed. Reaction sounds use [ZzFX](https://github.com/KilledByAPixel/ZzFX) by Frank Force. Image loading placeholders adapt [Generative Loaders](https://generativeloaders.com) by Kasturi Khanke. Anime characters belong to their original creators and studios.

If you enjoy AniBoop, consider [supporting on Buy Me a Coffee](https://buymeacoffee.com/nmrisrl11).

## License

AniBoop's original software and associated documentation are available under the [MIT License](LICENSE). Anime characters, mascot artwork, and AniBoop branding are outside the MIT grant. Fonts and third-party code carry their own license terms. See [Licensing and third-party notices](docs/LICENSING.md) for scope and attribution.
