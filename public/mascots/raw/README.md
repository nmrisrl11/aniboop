# Raw mascot sprite sheets

Place new character sprite sheets here. Each character has two sheets, with nine tiles in a 3 × 3 grid on each sheet.

1. `<character-id>-directions.webp` or `.png` for head directions.
2. `<character-id>-reactions.webp` or `.png` for reaction expressions.

Run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"` from the repository root to generate the optimized sheets and preview and add the character to the catalog. See [Adding a mascot](../../../docs/GALLERY_ASSETS.md#adding-a-mascot) for prerequisites and file sizes.
