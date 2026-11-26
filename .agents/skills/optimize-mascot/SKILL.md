---
name: optimize-mascot
description: Add AniBoop mascots from paired raw PNG or WebP sheets, generate and verify gallery assets, and move successful source pairs to raw/processed. Also use for standalone sprite sheet optimization.
metadata:
  short-description: Optimize mascot sprite sheets to sheets/
---

# Mascot Optimizer

Automates the end-to-end optimization of 3×3 chibi mascot sprite sheets from `public/mascots/raw/` into `public/mascots/sheets/`.

If `public/mascots/sheets/` does not exist yet in a project, this skill automatically creates it.

## Add or update mascots in the catalog

- Scan only the top level of `public/mascots/raw/` for matching `<id>-directions` and `<id>-reactions` sheets. Each sheet must be 1080 × 1080. Check the catalog for existing IDs and use project metadata for each display name and series.
- For each complete **new** pair, run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"` from the repository root. This generates all five WebPs in staging, uploads them directly to Cloudflare R2 **before** writing `src/data/characters.json` (preventing cache/404 races on open dev tabs), records the character's content hash (`v`) in `src/data/characters.json`, and archives originals under `public/mascots/raw/processed/`. Run additions sequentially because they share a catalog.
- For **updating/replacing** an existing character's artwork, run `npm run mascot:update -- --id <id>`. This regenerates all five WebPs in staging, uploads them directly to Cloudflare R2 **before** writing the new `v` hash to `src/data/characters.json` (preventing Cloudflare from caching old artwork under the new immutable `?v=<hash>`), backs up local WebPs to `public/old-version/mascots/`, updates `src/data/characters.json`, and archives originals. Avoid `--skip-r2` when a dev server is running against live R2.
- All generated mascot assets (`previews/`, `gallery-sheets/`, `sheets/`) and raw/processed archives are Git-ignored; only `src/data/characters.json` (with `v` hashes) and `public/mascots/raw/README.md` are committed to Git. Verify R2 parity anytime with `npm run mascot:sync-r2 -- --check` and live CDN bytes with `npm run mascot:sync-r2 -- --verify-cdn --character <id>`.
- After the last successful addition or update in a batch, update the README character and series totals from the catalog and check affected featured previews (served from `https://aniboop-assets.nmrisrl.dev/previews/`). When updating a character featured in `README.md`, include `?v=<new_hash>` on its image URL so Cloudflare and GitHub's image proxy fetch the updated preview. Include the README edits with the catalog change.

See [Adding a mascot](../../../docs/GALLERY_ASSETS.md#adding-a-mascot) for output paths and gallery checks.

## Standalone optimization

1. **Place raw sheets in `public/mascots/raw/`**:
   - `{character}-directions.webp` (or `.png`)
   - `{character}-reactions.webp` (or `.png`)

2. **Run optimization**:
   Install Pillow and NumPy with `python -m pip install Pillow numpy`. The script creates `public/mascots/sheets/` if missing, cleans alpha noise, zeroes out transparent RGB values, and outputs verified high-compression WebP files.

   ```bash
   # Standard batch run: processes all sheets in raw/ -> sheets/
   python .agents/skills/optimize-mascot/scripts/optimize.py

   # Optimize a single new character
   python .agents/skills/optimize-mascot/scripts/optimize.py --character asta

   # Asset-only workflow: optimize and move raw files to processed/
   python .agents/skills/optimize-mascot/scripts/optimize.py --character tanjiro --move
   ```

3. **Verify output**:
   Each sheet in `public/mascots/sheets/` is verified:
   - The decoded dimensions match the source. The optimizer warns about source dimensions other than 1080×1080 unless custom sizes are allowed.
   - The decoded image mode is RGBA. The optimizer reports the percentage of fully transparent pixels.

Use `--dry-run` to preview savings without writing image files.

## References & Documentation

- **CLI Options & Recipes**: See [references/cli_usage.md](references/cli_usage.md) for all arguments, custom directories, and npm script usage.
- **Pipeline Architecture & Benchmarks**: See [references/pipeline_specs.md](references/pipeline_specs.md) for transparency cleanup, encoding defaults, and verification.
