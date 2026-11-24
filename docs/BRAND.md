# AniBoop brand

AniBoop is an interactive collection of chibi anime characters. The signature interaction is a boop that makes a character react. The voice is playful in headlines and clear in controls and download details.

## Copy

The table below lists the approved copy across gallery surfaces. The homepage displays character names and gallery controls. The gallery instructions are available to screen readers.

| Surface              | Copy                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                 | AniBoop                                                                                                                                        |
| Browser title        | AniBoop \| Interactive Chibi Anime Characters                                                                                                  |
| Slogan               | Little characters. Big reactions.                                                                                                              |
| Homepage headline    | Pick a character. Give it a boop.                                                                                                              |
| Homepage description | Explore a collection of chibi anime characters. Tap one to see it react, then download its poses and reactions.                                |
| Meta description     | Explore a pannable gallery of chibi anime characters. Boop mascots to see them react, or search the catalog by character name or anime series. |
| Gallery heading      | Chibi anime character gallery                                                                                                                  |
| Skip link            | Skip to gallery                                                                                                                                |
| Gallery instructions | Tap or hold a character to boop. Drag, scroll, or use arrow keys to explore.                                                                   |
| Card action          | View & download                                                                                                                                |
| Detail labels        | Directions, Reactions, Resolution (1080 HD, 504 Web)                                                                                           |

The top bar includes Component, Credits, the GitHub repository link, the Buy Me a Coffee support link, the current boop order, Catalog, Appearance, and Reaction sounds. Below the medium breakpoint, Catalog stays in the header and the secondary controls move into More options. Boop order offers In order, Random, and Build up. Appearance offers System, Light, and Dark. Reaction sounds displays On or Off in More options. The catalog title shows the character total and switches to a match count when search or a series filter is active.

Use search topics naturally in relevant pages. Start with chibi anime characters, anime mascots, and interactive character galleries. See [SEO and site discovery](SEO.md) for the metadata fields and how to verify them.

## Typography

| Token          | Family                                     | Use                                                     |
| -------------- | ------------------------------------------ | ------------------------------------------------------- |
| `font-heading` | Allo Bold                                  | Major headings                                          |
| `font-sans`    | Inter Variable, with system sans fallbacks | Navigation, character names, controls, and descriptions |
| `font-mono`    | System monospace                           | Filenames, dimensions, and file sizes                   |

Use tabular numerals where counts need to align. The two upright WOFF2 assets total 99,800 bytes (97.5 KiB), within the revised 100 KiB cold-load font budget. Native fonts cover scripts outside the shipped font subsets. The font directory includes the licenses for [Allo 1.0.1](../src/app/fonts/OFL.txt) and [Inter from Fontsource 5.3.0](../src/app/fonts/Inter-OFL.txt).

## Palette

| Role                 | Light     | Dark      |
| -------------------- | --------- | --------- |
| Background           | `#F3EFFA` | `#15121D` |
| Card                 | `#FEFCFF` | `#211D2B` |
| Foreground           | `#241B35` | `#F6F3FF` |
| Muted foreground     | `#665C75` | `#BDB2CD` |
| Primary and focus    | `#6A3BD1` | `#BCA4FF` |
| Primary foreground   | `#FFFFFF` | `#23143C` |
| Secondary            | `#EDE4FF` | `#382953` |
| Secondary foreground | `#4D288E` | `#E4D6FF` |
| Accent               | `#E7DBFB` | `#453260` |

The wordmark's violet anchors the palette. A pale lavender canvas and near-white cards frame the artwork in light mode. Dark mode uses a muted plum canvas with slightly lighter cards to give dark silhouettes room to read. The secondary fill appears on the Catalog button and the selected Boop order option at rest. The accent fill marks highlighted and pressed states. Primary violet is used for primary actions and focus rings. Series captions use the muted foreground.

## Logo and marks

The [full-color AniBoop logo](../public/brand/aniboop-logo.svg) appears in the intro splash screen, the app header, the 404 and error pages, the [README](../README.md) heading, and the social preview. The [purple tap mark](../src/app/icon.svg) appears in the favicon and install icons. Render raster icons directly from the tap-mark SVG at their target sizes. Use an opaque, full-bleed purple background for launcher masks and the Apple touch icon. See [Fonts and metadata](ARCHITECTURE.md#fonts-and-metadata) for the published assets.

The body background repeats the [flat AniBoop wordmark](../public/aniboop-watermark.svg) in staggered rows. Each mark is tilted 24 degrees and uses the active theme's violet at low opacity.

## Corner shapes

Pair a baseline fallback `rounded-*` utility with `corner-squircle` and the `squircle:` variant (`@supports (corner-shape: squircle)` in [globals.css](../src/app/globals.css)). Because `superellipse(2)` cuts less off each corner than a circular arc of the same radius, native squircles step up in radius so the continuous curve stays visually clear while unsupported browsers keep balanced rounded corners:

- Controls, inputs, and buttons: `rounded-lg` → `squircle:rounded-2xl` (compact `sm`/`xs` controls: `squircle:rounded-xl`)
- Cards, menus, popovers, and code blocks: `rounded-xl` → `squircle:rounded-3xl`
- Dialogs and drawers: `rounded-2xl` → `squircle:rounded-[32px]` (directional on drawers)
- Gallery tiles: `rounded-3xl` → `squircle:rounded-[44px]`
- Square (`1:1`) icon containers and portrait frames: `rounded-lg` / `rounded-2xl` → `squircle:rounded-full`

Reserve `squircle:rounded-full` for square elements so rectangular surfaces never distort into ovals or pills, and keep `rounded-full` alone for intentional circles, badges, and pills. Align nested inner and outer radii concentrically across both fallback and `squircle:` paths. Keep default corner styling in [globals.css](../src/app/globals.css) and shared component primitives in [`src/components/ui`](../src/components/ui). `@toolwind/corner-shape` generates CSS at build time. See [Corner-shape conventions](DEVELOPMENT.md#corner-shape-conventions) for usage rules.
