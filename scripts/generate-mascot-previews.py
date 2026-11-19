"""Generate static previews and smaller direction sheets for the gallery."""

import argparse
from pathlib import Path

from PIL import Image

ASSETS_DIR = Path(__file__).resolve().parents[1] / "public" / "mascots"
GALLERY_CELL_SIZE = 168


def save_webp(image, output, quality):
    temporary = output.with_suffix(".tmp.webp")
    image.save(temporary, quality=quality, alpha_quality=100, method=6)
    temporary.replace(output)
    print(f"{output.name}: {output.stat().st_size:,} bytes")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character", help="Generate the gallery assets for one character ID")
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
            rgba = image.convert("RGBA")
            preview = rgba.resize(
                (248, 248), Image.Resampling.LANCZOS, (cell, cell, cell * 2, cell * 2)
            )
            directions = Image.new("RGBA", (GALLERY_CELL_SIZE * 3, GALLERY_CELL_SIZE * 3))
            for row in range(3):
                for column in range(3):
                    # Resize each pose separately so the filter cannot sample across cells.
                    pose = rgba.crop(
                        (column * cell, row * cell, (column + 1) * cell, (row + 1) * cell)
                    ).resize((GALLERY_CELL_SIZE, GALLERY_CELL_SIZE), Image.Resampling.LANCZOS)
                    directions.paste(pose, (column * GALLERY_CELL_SIZE, row * GALLERY_CELL_SIZE))

        save_webp(preview, previews / f"{sheet.stem.removesuffix('-directions')}.webp", 78)
        save_webp(directions, previews / sheet.name, 65)


if __name__ == "__main__":
    main()
