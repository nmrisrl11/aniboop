"""Prepare gallery assets, register a mascot, and archive its source sheets."""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "mascots"
RAW = ASSETS / "raw"
PROCESSED = RAW / "processed"
CATALOG = ROOT / "src" / "data" / "characters.json"
OPTIMIZER = ROOT / ".agents" / "skills" / "optimize-mascot" / "scripts" / "optimize.py"
PREVIEW_GENERATOR = ROOT / "scripts" / "generate-mascot-previews.py"
R2_SYNC = ROOT / "scripts" / "sync-r2.py"


def find_raw_sheet(character_id, kind):
    stem = f"{character_id}-{kind}"
    matches = [
        path
        for path in RAW.glob(f"{stem}.*")
        if path.is_file() and path.suffix.lower() in {".png", ".webp"}
    ]
    if len(matches) != 1:
        raise ValueError(f"Expected exactly one {stem}.png or {stem}.webp in public/mascots/raw.")

    sheet = matches[0]
    with Image.open(sheet) as image:
        if image.format not in {"PNG", "WEBP"} or image.size != (1080, 1080):
            raise ValueError(f"{sheet.name} must be a 1080 x 1080 PNG or WebP.")
        image.verify()
    return sheet


def add_mascot(character, staging):
    original_catalog = CATALOG.read_bytes()
    catalog = json.loads(original_catalog)
    character_id = character["id"]
    if any(entry["id"] == character_id for entry in catalog):
        raise ValueError(f"{character_id} is already in the catalog.")

    sheets = [find_raw_sheet(character_id, kind) for kind in ("directions", "reactions")]
    archive_pairs = [(sheet, PROCESSED / sheet.name) for sheet in sheets]
    for _, destination in archive_pairs:
        if destination.exists() or destination.is_symlink():
            raise ValueError(f"An archived source already exists in raw/processed for {destination.name}.")

    for sheet in sheets:
        subprocess.run(
            [sys.executable, str(OPTIMIZER), "--src", str(sheet), "--dest", str(staging / "sheets")],
            cwd=ROOT,
            check=True,
        )
    subprocess.run(
        [sys.executable, str(PREVIEW_GENERATOR), "--character", character_id, "--assets-dir", str(staging)],
        cwd=ROOT,
        check=True,
    )

    output_paths = [
        Path("previews") / f"{character_id}.webp",
        Path("gallery-sheets") / f"{character_id}-directions.webp",
        Path("gallery-sheets") / f"{character_id}-reactions.webp",
        Path("sheets") / f"{character_id}-directions.webp",
        Path("sheets") / f"{character_id}-reactions.webp",
    ]
    for relative_path in output_paths:
        destination = ASSETS / relative_path
        if destination.exists() and destination.read_bytes() != (staging / relative_path).read_bytes():
            raise ValueError(f"Existing asset differs from the generated file at {destination.relative_to(ROOT)}.")

    digest = hashlib.sha256()
    for relative_path in output_paths:
        remote_key = relative_path.as_posix()
        digest.update(remote_key.encode("utf-8"))
        digest.update(b"\0")
        digest.update((staging / relative_path).read_bytes())
        digest.update(b"\0")
    entry = {**character, "v": digest.hexdigest()[:8]}

    updated_catalog = staging / CATALOG.name
    updated_catalog.write_text(
        json.dumps([*catalog, entry], ensure_ascii=False, indent="\t") + "\n", encoding="utf-8"
    )
    published = []
    archived = []
    try:
        for relative_path in output_paths:
            destination = ASSETS / relative_path
            if not destination.exists():
                destination.parent.mkdir(parents=True, exist_ok=True)
                (staging / relative_path).replace(destination)
                published.append(destination)
        if CATALOG.read_bytes() != original_catalog:
            raise ValueError("The catalog changed during generation. Run the command again.")
        PROCESSED.mkdir(exist_ok=True)
        for sheet, destination in archive_pairs:
            if destination.exists() or destination.is_symlink():
                raise ValueError(f"An archived source already exists in raw/processed for {destination.name}.")
            sheet.rename(destination)
            archived.append((sheet, destination))
        updated_catalog.replace(CATALOG)
    except Exception:
        for sheet, destination in reversed(archived):
            destination.rename(sheet)
        for destination in published:
            destination.unlink()
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", required=True, help="Stable lowercase ID used in the raw filenames")
    parser.add_argument("--name", required=True, help="Name shown in the gallery")
    parser.add_argument("--series", required=True, help="Series or collection name")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.id):
        parser.error("--id must use lowercase letters, numbers, and single hyphens.")
    if not args.name.strip() or not args.series.strip():
        parser.error("--name and --series must be nonempty.")

    temp = ROOT / "temp"
    temp.mkdir(exist_ok=True)
    lock = temp / "mascot-add.lock"
    try:
        lock.touch(exist_ok=False)
    except FileExistsError:
        parser.error("Another mascot:add run holds temp/mascot-add.lock. Check that it has stopped before removing the lock.")
    character = {"id": args.id, "name": args.name.strip(), "series": args.series.strip()}
    try:
        with TemporaryDirectory(prefix="mascot-add-", dir=temp) as staging:
            add_mascot(character, Path(staging))
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"mascot:add: {error}\n")
    finally:
        lock.unlink()
    print(f"Added {args.id} to the catalog with five WebPs and moved its originals to raw/processed.")
    if R2_SYNC.is_file():
        subprocess.run([sys.executable, str(R2_SYNC), "--character", args.id], cwd=ROOT)


if __name__ == "__main__":
    main()
