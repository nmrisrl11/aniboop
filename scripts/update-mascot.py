#!/usr/bin/env python3
"""Replace an existing mascot's artwork from raw sheets, refresh its version hash, and sync all 5 WebPs to Cloudflare R2."""

import argparse
import hashlib
import re
import shutil
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image

from catalog import CATALOG_DIR, catalog_snapshot, find_character, update_character_version

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "mascots"
BACKUP = ROOT / "public" / "old-version" / "mascots"
RAW = ASSETS / "raw"
PROCESSED = RAW / "processed"
OPTIMIZER = ROOT / ".agents" / "skills" / "optimize-mascot" / "scripts" / "optimize.py"
PREVIEW_GENERATOR = ROOT / "scripts" / "generate-mascot-previews.py"
R2_SYNC = ROOT / "scripts" / "sync-r2.py"


def find_raw_sheet(character_id: str, kind: str) -> Path:
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


def update_mascot(character_id: str, staging: Path, keep_raw: bool = False, skip_r2: bool = False) -> str:
    original_snapshot = catalog_snapshot()
    if find_character(character_id) is None:
        raise ValueError(f"{character_id} is not in {CATALOG_DIR.relative_to(ROOT)}. Use mascot:add for new characters.")

    sheets = [find_raw_sheet(character_id, kind) for kind in ("directions", "reactions")]

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

    digest = hashlib.sha256()
    for relative_path in output_paths:
        remote_key = relative_path.as_posix()
        digest.update(remote_key.encode("utf-8"))
        digest.update(b"\0")
        digest.update((staging / relative_path).read_bytes())
        digest.update(b"\0")
    new_version = digest.hexdigest()[:8]

    if catalog_snapshot() != original_snapshot:
        raise ValueError("The catalog changed during generation. Run the command again.")

    # Upload all five staged WebPs to R2 BEFORE publishing the new version hash in src/data/characters/.
    # Otherwise, an open dev server or client fetching ?v=<new_version> before R2 finishes would
    # cause Cloudflare to cache the old object under the new immutable version query string.
    if not skip_r2 and R2_SYNC.is_file():
        subprocess.run(
            [sys.executable, str(R2_SYNC), "--character", character_id, "--assets-dir", str(staging)],
            cwd=ROOT,
            check=True,
        )

    # Back up any existing local WebPs to public/old-version/mascots/ before overwriting.
    for relative_path in output_paths:
        existing = ASSETS / relative_path
        if existing.is_file():
            backup_dest = BACKUP / relative_path
            backup_dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(existing, backup_dest)

    for relative_path in output_paths:
        destination = ASSETS / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        (staging / relative_path).replace(destination)

    if catalog_snapshot() != original_snapshot:
        raise ValueError("The catalog changed during upload. Run the command again.")

    update_character_version(character_id, new_version, staging)

    if not keep_raw:
        PROCESSED.mkdir(exist_ok=True)
        for sheet in sheets:
            destination = PROCESSED / sheet.name
            if destination.exists():
                destination = PROCESSED / f"{sheet.stem}-{new_version}{sheet.suffix}"
            sheet.rename(destination)

    return new_version


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", required=True, help="Existing catalog character ID to update")
    parser.add_argument("--keep-raw", action="store_true", help="Leave raw files in public/mascots/raw instead of archiving")
    parser.add_argument("--skip-r2", action="store_true", help="Skip uploading updated assets to Cloudflare R2")
    args = parser.parse_args()

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.id):
        parser.error("--id must use lowercase letters, numbers, and single hyphens.")

    temp = ROOT / "temp"
    temp.mkdir(exist_ok=True)
    lock = temp / "mascot-add.lock"
    try:
        lock.touch(exist_ok=False)
    except FileExistsError:
        parser.error("Another mascot workflow holds temp/mascot-add.lock. Check that it has stopped before removing it.")

    try:
        with TemporaryDirectory(prefix="mascot-update-", dir=temp) as staging:
            new_version = update_mascot(args.id, Path(staging), keep_raw=args.keep_raw, skip_r2=args.skip_r2)
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"mascot:update: {error}\n")
    finally:
        lock.unlink()

    print(f"Updated {args.id} (v={new_version}) with five regenerated WebPs.")
    if args.skip_r2:
        print(
            f"[WARNING] --skip-r2 was used. Upload '{args.id}' with "
            f"'npm run mascot:sync-r2 -- --character {args.id}' before loading the app against live R2 "
            f"to avoid poisoning the Cloudflare cache for ?v={new_version}."
        )


if __name__ == "__main__":
    main()
