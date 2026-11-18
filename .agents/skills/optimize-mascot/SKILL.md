---
name: optimize-mascot
description: Optimize mascot sprite sheets (WebP/PNG) from public/mascots/raw into public/mascots/sheets with lossy WebP color compression and full-quality alpha encoding after transparency cleanup. Automatically creates destination sheets folder if missing.
metadata:
  short-description: Optimize mascot sprite sheets to sheets/
---

# Mascot Optimizer

Automates the end-to-end optimization of 3×3 chibi mascot sprite sheets from `public/mascots/raw/` into `public/mascots/sheets/`.

If `public/mascots/sheets/` does not exist yet in a project, this skill automatically creates it.

## Standard Project Workflow

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

   # Full workflow: optimize and move raw files to archive/
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
