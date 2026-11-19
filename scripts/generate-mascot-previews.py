"""Generate WebP previews from the center cells of the optimized direction sheets."""

import argparse
from pathlib import Path

from PIL import Image

ASSETS_DIR = Path(__file__).resolve().parents[1] / "public" / "mascots"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character", help="Generate the preview for one character ID")
    parser.add_argument("--assets-dir", type=Path, default=ASSETS_DIR)
    args = parser.parse_args()
    character = args.character
    assets = args.assets_dir
    sheets = sorted((assets / "sheets").glob("*-directions.webp"))
    if character:
        sheets = [sheet for sheet in sheets if sheet.stem == f"{character}-directions"]
    if not sheets:
        parser.error("No matching direction sheets in public/mascots/sheets")

    previews = assets / "previews"
    previews.mkdir(exist_ok=True)
    for sheet in sheets:
        with Image.open(sheet) as image:
            width, height = image.size
            if width != height or width % 3:
                parser.error(f"{sheet.name} must be a square 3×3 sprite sheet")
            cell = width // 3
            preview = image.convert("RGBA").resize(
                (248, 248), Image.Resampling.LANCZOS, (cell, cell, cell * 2, cell * 2)
            )

        output = previews / f"{sheet.stem.removesuffix('-directions')}.webp"
        temporary = output.with_suffix(".tmp.webp")
        preview.save(temporary, quality=78, alpha_quality=100, method=6)
        temporary.replace(output)
        print(f"{output.name}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
