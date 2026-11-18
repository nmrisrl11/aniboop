# Mascot Optimizer CLI Guide

Run `optimize.py` from the repository root. Install Pillow and NumPy with `python -m pip install Pillow numpy`.

## Standard Flow

1. Place incoming/unoptimized sprite sheets into `public/mascots/raw/`.
2. Run the optimizer (`npm run mascot:optimize` or python command).
3. If `public/mascots/sheets/` does not exist yet, the script automatically creates it.
4. Optimized WebP sheets with an alpha channel are written to `public/mascots/sheets/`.

```bash
# Process all raw sheets in public/mascots/raw -> output to public/mascots/sheets
python .agents/skills/optimize-mascot/scripts/optimize.py

# Via npm script
npm run mascot:optimize
```

---

## Command-Line Flags

| Flag | Short | Default | Description |
| :--- | :--- | :--- | :--- |
| `--src` | `-s` | `public/mascots/raw` | Source directory or path to a specific sprite sheet file. |
| `--dest` | `-d` | `public/mascots/sheets` | Destination directory for optimized WebP sheets (automatically created if missing). |
| `--character` | `-c` | *(all)* | Target a specific character ID (e.g. `--character asta`). |
| `--quality` | `-q` | `80` | WebP lossy quality (1-100). Balanced for highest fidelity and small size. |
| `--alpha-quality` | `-aq` | `100` | WebP alpha quality (100 = lossless alpha compression). |
| `--method` | `-m` | `6` | Compression effort (0-6). 6 = deepest block search. |
| `--clean-noise` | `-cn` | `1` | Clamps alpha $\le$ threshold to 0 to eliminate chroma-key haze. |
| `--move` | | `false` | Moves raw files to `archive/` after successful verification. |
| `--archive-dir` | | `<src>/archive` | Custom directory to move raw files into when `--move` is set. |
| `--dry-run` | | `false` | Simulates optimization and reports projected savings without writing image files. |
| `--allow-custom-size`| | `false` | Allows non-1080x1080 sheets without dimension warnings. |
| `--verbose` | `-v` | `false` | Displays per-sheet pixel cleanup counts and technical stats. |

---

## Common Recipes

### 1. Optimize a single new character and move raw files to archive
```bash
python .agents/skills/optimize-mascot/scripts/optimize.py \
  --character tanjiro \
  --move
```

### 2. Dry-run preview of savings
```bash
python .agents/skills/optimize-mascot/scripts/optimize.py --dry-run
```

### 3. Process an individual file
```bash
python .agents/skills/optimize-mascot/scripts/optimize.py \
  --src "characters/custom/custom-directions.png" \
  --dest "public/mascots/sheets"
```

### 4. Custom quality & noise threshold
```bash
python .agents/skills/optimize-mascot/scripts/optimize.py \
  --quality 85 \
  --clean-noise 2
```

---

## Directory Conventions

- **Raw / Incoming**: `public/mascots/raw/` (override with `--src`)
  - `{character}-directions.webp` or `.png`
  - `{character}-reactions.webp` or `.png`
- **Final Optimized Sheets**: `public/mascots/sheets/` (created automatically if missing)
- **Archived Raw**: `public/mascots/raw/archive/` (when `--move` is passed)
