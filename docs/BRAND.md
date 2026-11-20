# AniBoop brand

AniBoop is an interactive collection of chibi anime characters. The signature interaction is a boop that makes a character react. The voice is playful in headlines and clear in controls and download details.

## Copy

The copy below includes planned gallery surfaces. The homepage displays character names and gallery controls. The gallery instructions are available to screen readers.

| Surface              | Copy                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Name                 | AniBoop                                                                                                            |
| Browser title        | AniBoop \| Boop & Download Chibi Anime Characters                                                                  |
| Slogan               | Little characters. Big reactions.                                                                                  |
| Homepage headline    | Pick a character. Give it a boop.                                                                                  |
| Homepage description | Explore a collection of chibi anime characters. Tap one to see it react, then download its poses and reactions.    |
| Meta description     | Browse chibi anime mascots, boop them to see them react, and download their directional poses and reaction assets. |
| Gallery instructions | Tap or hold a character to boop. Drag, scroll, or use arrow keys to explore.                                       |
| Card action          | View & download                                                                                                    |
| Detail labels        | Directions, Reactions, Download                                                                                    |

The dock uses Boop order, Appearance, and Catalog. Boop order offers In order, Random, and Build up. Appearance offers System, Light, and Dark.

Use search topics naturally in relevant pages. Start with chibi anime characters, anime mascots, interactive chibi characters, downloadable chibi poses, and chibi reaction assets.

## Typography

| Token          | Family                                     | Use                                                     |
| -------------- | ------------------------------------------ | ------------------------------------------------------- |
| `font-heading` | Allo Bold                                  | Wordmark and major headings                             |
| `font-sans`    | Inter Variable, with system sans fallbacks | Navigation, character names, controls, and descriptions |
| `font-mono`    | System monospace                           | Filenames, dimensions, and file sizes                   |

Use tabular numerals where counts need to align. The two upright WOFF2 assets total 99,800 bytes (97.5 KiB), within the revised 100 KiB cold-load font budget. Native fonts cover scripts outside the shipped font subsets. The font directory includes the licenses for [Allo 1.0.1](../src/app/fonts/OFL.txt) and [Inter from Fontsource 5.3.0](../src/app/fonts/Inter-OFL.txt).

## Palette

| Role               | Light     | Dark      |
| ------------------ | --------- | --------- |
| Background         | `#FFF9F2` | `#171321` |
| Card               | `#FFFFFF` | `#231D30` |
| Foreground         | `#21192D` | `#F8F5FF` |
| Primary            | `#6A3BD1` | `#BDA7FF` |
| Primary foreground | `#F6F3FF` | `#171321` |
| Boop lilac         | `#E9DCFF` | `#4A326E` |
| Boop peach         | `#FFDBC5` | `#5B3538` |

Use peach and lilac sparingly so the character artwork stays prominent. The concentric tap ripple serves as the favicon and appears in the social preview.

The body background repeats a faint [AniBoop wordmark](../public/aniboop-watermark.svg) in staggered rows. The SVG uses Allo Bold outlines and the primary tint for each color scheme.

## Corner shapes

Use `squircle` on cards, banners, tiles, and other surfaces that need adaptive corners. The radius scales with the element in both dimensions and caps at 2 rem for the rounded fallback and 2.5 rem for the native squircle. This keeps corners modest on short banners and compact tiles. For controls with a fixed radius, pair `corner-squircle` with the existing `rounded-*` utility. Keep `rounded-full` for circles such as the tap ripple.

Keep corner styling in the [global stylesheet](../src/app/globals.css) and shared component variants. `@toolwind/corner-shape` generates CSS at build time.
