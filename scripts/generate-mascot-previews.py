"""Generate consistently framed center previews and pose sheets for the gallery."""

import argparse
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "public" / "mascots"
CATALOG = ROOT / "src" / "data" / "characters.json"
GALLERY_CELL_SIZE = 168
PREVIEW_SIZE = 248
NEUTRAL_POSE = 4
VISIBLE_ALPHA = 24
TARGET_HEIGHT = 0.83
BASELINE = 0.925
EDGE_PADDING = 0.025


def read_poses(path):
    with Image.open(path) as image:
        width, height = image.size
        if not width or width != height or width % 3:
            raise ValueError(f"{path.name} must be a square 3×3 sprite sheet")
        cell = width // 3
        rgba = image.convert("RGBA")
        return [
            rgba.crop((x, y, x + cell, y + cell))
            for y in range(0, height, cell)
            for x in range(0, width, cell)
        ]


def framing(neutral, poses):
    # Use visible artwork for alignment and preserve the softer alpha at the edges.
    visible = neutral.getchannel("A").point(lambda alpha: 255 if alpha >= VISIBLE_ALPHA else 0)
    if not (bounds := visible.getbbox()):
        raise ValueError("the center direction pose has no visible artwork")
    left, top, right, bottom = bounds
    center = (left + right) / 2

    pose_bounds = [pose.getchannel("A").getbbox() for pose in poses]
    if any(bound is None for bound in pose_bounds):
        raise ValueError("each direction and reaction cell must contain artwork")
    leftmost = min(bound[0] for bound in pose_bounds)
    topmost = min(bound[1] for bound in pose_bounds)
    rightmost = max(bound[2] for bound in pose_bounds)
    lowest = max(bound[3] for bound in pose_bounds)

    # One transform for the whole mascot keeps poses registered when the sprite switches.
    scale = min(
        TARGET_HEIGHT / (bottom - top),
        (0.5 - EDGE_PADDING) / max(center - leftmost, rightmost - center),
        (BASELINE - EDGE_PADDING) / (bottom - topmost),
    )
    if lowest > bottom:
        scale = min(scale, (1 - EDGE_PADDING - BASELINE) / (lowest - bottom))
    return scale, 0.5 - center * scale, BASELINE - bottom * scale


def render_pose(pose, size, layout):
    scale, left, top = layout
    factor = scale * size
    if factor > 1:
        # Sample directly into the frame when a small silhouette needs enlargement.
        return pose.transform(
            (size, size),
            Image.Transform.AFFINE,
            (1 / factor, 0, -left / scale, 0, 1 / factor, -top / scale),
            Image.Resampling.BICUBIC,
        )
    side = max(1, round(pose.width * factor))
    resized = pose.resize((side, side), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (size, size))
    frame.paste(resized, (round(left * size), round(top * size)))
    return frame


def render_sheet(poses, layout):
    size = GALLERY_CELL_SIZE
    sheet = Image.new("RGBA", (size * 3, size * 3))
    for index, pose in enumerate(poses):
        sheet.paste(render_pose(pose, size, layout), (index % 3 * size, index // 3 * size))
    return sheet


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
    assets = args.assets_dir.resolve()
    source = assets / "sheets"
    try:
        if args.character:
            characters = [args.character]
        elif assets == ASSETS_DIR:
            characters = [entry["id"] for entry in json.loads(CATALOG.read_text(encoding="utf-8"))]
        else:
            characters = [
                path.stem.removesuffix("-directions") for path in sorted(source.glob("*-directions.webp"))
            ]
    except (OSError, ValueError) as error:
        parser.error(str(error))
    if not characters:
        parser.error(f"No mascots selected in {source}")
    if args.character and not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.character):
        parser.error("--character must use lowercase letters, numbers, and single hyphens")

    previews = assets / "previews"
    gallery_sheets = assets / "gallery-sheets"
    previews.mkdir(exist_ok=True)
    gallery_sheets.mkdir(exist_ok=True)
    for character_id in characters:
        direction_sheet = source / f"{character_id}-directions.webp"
        reaction_sheet = source / f"{character_id}-reactions.webp"
        try:
            directions = read_poses(direction_sheet)
            reactions = read_poses(reaction_sheet)
            neutral = directions[NEUTRAL_POSE]
            if reactions[0].size != neutral.size:
                raise ValueError("direction and reaction sheets must have matching dimensions")
            layout = framing(neutral, directions + reactions)

            save_webp(render_pose(neutral, PREVIEW_SIZE, layout), previews / f"{character_id}.webp", 78)
            save_webp(render_sheet(directions, layout), gallery_sheets / direction_sheet.name, 65)
            save_webp(render_sheet(reactions, layout), gallery_sheets / reaction_sheet.name, 65)
        except (OSError, ValueError) as error:
            parser.error(f"{character_id}: {error}")


if __name__ == "__main__":
    main()
