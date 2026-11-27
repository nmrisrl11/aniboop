# Raw mascot sprite sheets

Place new character sprite sheets here. Each character has two sheets, with nine tiles in a 3 × 3 grid on each sheet.

1. `<character-id>-directions.webp` or `.png` for head directions.
2. `<character-id>-reactions.webp` or `.png` for reaction expressions.

Run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"` from the repository root for a new character, or `npm run mascot:update -- --id <id>` to replace an existing character's artwork. On success, the command updates the character's series file under `src/data/characters/` with its content hash (`v`), moves the original pair to `processed/`, and uploads all five WebPs (`previews/`, `gallery-sheets/`, `sheets/`) to Cloudflare R2. Git ignores the raw sheets, processed archive, and generated WebPs. See [Adding a mascot](../../../docs/GALLERY_ASSETS.md#adding-a-mascot) and [Cloudflare R2 storage](../../../docs/R2_STORAGE.md) for prerequisites and output sizes.
