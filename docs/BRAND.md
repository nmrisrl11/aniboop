# AniBoop brand

AniBoop is an interactive collection of chibi anime characters. The signature interaction is a boop that makes a character react. The voice is playful in headlines and clear in controls and download details.

## Copy

The copy below includes planned gallery surfaces. The homepage displays character names and gallery controls. The gallery instructions are available to screen readers.

| Surface              | Copy                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                 | AniBoop                                                                                                                                        |
| Browser title        | AniBoop \| Interactive Chibi Anime Characters                                                                                                  |
| Slogan               | Little characters. Big reactions.                                                                                                              |
| Homepage headline    | Pick a character. Give it a boop.                                                                                                              |
| Homepage description | Explore a collection of chibi anime characters. Tap one to see it react, then download its poses and reactions.                                |
| Meta description     | Explore a pannable gallery of chibi anime characters. Boop mascots to see them react, or search the catalog by character name or anime series. |
| Gallery instructions | Tap or hold a character to boop. Drag, scroll, or use arrow keys to explore.                                                                   |
| Card action          | View & download                                                                                                                                |
| Detail labels        | Directions, Reactions, Download                                                                                                                |

The top bar includes Component, Credits, the GitHub repository link, the current boop order, Catalog, Appearance, and Reaction sounds. Below the medium breakpoint, Catalog stays in the header and the secondary controls move into More options. Boop order offers In order, Random, and Build up. Appearance offers System, Light, and Dark. Reaction sounds displays On or Off in More options. The catalog title shows the character total and switches to a match count when search or a series filter is active.

Use search topics naturally in relevant pages. Start with chibi anime characters, anime mascots, and interactive character galleries. See [SEO and site discovery](SEO.md) for the metadata fields and how to verify them.

## Typography

| Token          | Family                                     | Use                                                     |
| -------------- | ------------------------------------------ | ------------------------------------------------------- |
| `font-heading` | Allo Bold                                  | Major headings                                          |
| `font-sans`    | Inter Variable, with system sans fallbacks | Navigation, character names, controls, and descriptions |
| `font-mono`    | System monospace                           | Filenames, dimensions, and file sizes                   |

Use tabular numerals where counts need to align. The two upright WOFF2 assets total 99,800 bytes (97.5 KiB), within the revised 100 KiB cold-load font budget. Native fonts cover scripts outside the shipped font subsets. The font directory includes the licenses for [Allo 1.0.1](../src/app/fonts/OFL.txt) and [Inter from Fontsource 5.3.0](../src/app/fonts/Inter-OFL.txt).

## Palette

| Role               | Light     | Dark      |
| ------------------ | --------- | --------- |
| Background         | `#FAFAFA` | `#09090B` |
| Card               | `#FFFFFF` | `#131316` |
| Foreground         | `#18181B` | `#FAFAFA` |
| Primary            | `#18181B` | `#FAFAFA` |
| Primary foreground | `#FAFAFA` | `#09090B` |

Neutral app surfaces keep the character artwork prominent.

## Logo and marks

The [full-color AniBoop logo](../public/brand/aniboop-logo.svg) appears in the header and social preview. The [purple tap mark](../src/app/icon.svg) appears in the favicon and install icons. Render raster icons directly from the tap-mark SVG at their target sizes. Use an opaque, full-bleed purple background for launcher masks and the Apple touch icon. See [Fonts and metadata](ARCHITECTURE.md#fonts-and-metadata) for the published assets.

The body background repeats the [flat AniBoop wordmark](../public/aniboop-watermark.svg) in staggered rows. Each mark is tilted 24 degrees, and the SVG uses a neutral tint for the active theme.

## Corner shapes

Use `squircle` on cards, banners, tiles, and other surfaces that need adaptive corners. The radius scales with the element in both dimensions and caps at 2 rem for the rounded fallback and 2.5 rem for the native squircle. This keeps corners modest on short banners and compact tiles. For controls with a fixed radius, pair `corner-squircle` with the existing `rounded-*` utility. Keep `rounded-full` for circles such as the tap ripple.

Keep corner styling in the [global stylesheet](../src/app/globals.css) and shared component variants. `@toolwind/corner-shape` generates CSS at build time.
