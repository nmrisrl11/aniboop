---
name: optimize-mascot
description: Add AniBoop mascots from paired raw PNG or WebP sheets, generate and verify gallery assets, and move successful source pairs to raw/processed. Also use for standalone sprite sheet optimization.
metadata:
  short-description: Optimize mascot sprite sheets to sheets/
---

# Mascot Optimizer

Automates the end-to-end optimization of 3×3 chibi mascot sprite sheets from `public/mascots/raw/` into `public/mascots/sheets/`.

If `public/mascots/sheets/` does not exist yet in a project, this skill automatically creates it.

## Add mascots to the catalog

- Scan only the top level of `public/mascots/raw/` for matching `<id>-directions` and `<id>-reactions` sheets. Each sheet must be 1080 × 1080. Check the catalog for existing IDs and use project metadata for each display name and series.
- For each complete new pair, run `npm run mascot:add -- --id <id> --name "<name>" --series "<series>"` from the repository root. Run additions sequentially because they share a catalog.
- Verify the catalog entry, five generated WebPs, and both originals under `public/mascots/raw/processed/`. Leave incomplete or failed pairs in the raw inbox and report the issue. The README is the tracked file in the raw folder. The source sheets and processed archive are Git-ignored.

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
