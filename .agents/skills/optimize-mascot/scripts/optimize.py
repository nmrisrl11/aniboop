#!/usr/bin/env python3
"""
Mascot Sprite Sheet Optimizer (WebP)

Standard Flow:
1. Place incoming/unoptimized sprite sheets into `public/mascots/raw/`
   (`{character}-directions.webp|png` and `{character}-reactions.webp|png`).
2. Run this optimizer (via CLI or agent skill).
3. The optimizer automatically creates `public/mascots/sheets/` if it does not exist yet.
4. The fully optimized sheets are placed in `public/mascots/sheets/` with:
   - 100% clean transparent background (sub-perceptual alpha haze <= clean_noise zeroed).
   - All hidden/dirty RGB noise under transparent pixels completely zeroed out.
   - Lossless alpha channel (alpha_quality=100) preserving crisp antialiased silhouettes.
   - Maximum VP8 search (method=6) and balanced quality (default: 80) for 30%-38% size drop.
   - Dimensional (1080x1080) and mode (RGBA) verification.
5. Optionally move raw files to an archive (`--move`) to keep `raw/` clean for future characters.

Usage:
    python optimize.py [--src DIR_OR_FILE] [--dest DIR] [--character NAME] [--move] [--dry-run]
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

try:
    from PIL import Image
    import numpy as np
except ImportError as err:
    print(f"Error: Missing required library: {err}")
    print("Please install requirements: pip install Pillow numpy")
    sys.exit(1)


STANDARD_SHEET_SIZE = (1080, 1080)
DEFAULT_QUALITY = 80
DEFAULT_ALPHA_QUALITY = 100
DEFAULT_METHOD = 6
DEFAULT_CLEAN_NOISE = 1


def resolve_src_dir(repo_root: Path, custom_src: Optional[str] = None) -> Path:
    """
    Resolves the source directory for raw mascot sheets.
    If custom_src is a file, returns it directly.
    Otherwise ensures the directory exists and returns it.
    """
    if custom_src:
        src = Path(custom_src).resolve()
        if src.is_file():
            return src
        src.mkdir(parents=True, exist_ok=True)
        return src

    # Look for existing raw/unoptimized directories
    candidates = [
        repo_root / "public" / "mascots" / "raw",
        repo_root / "public" / "mascots" / "unoptimized",
        repo_root / "mascots" / "raw",
        repo_root / "raw",
    ]
    for c in candidates:
        if c.is_dir():
            return c

    # Default to public/mascots/raw and create it if missing
    default_src = repo_root / "public" / "mascots" / "raw"
    default_src.mkdir(parents=True, exist_ok=True)
    return default_src


def resolve_dest_dir(repo_root: Path, custom_dest: Optional[str] = None) -> Path:
    """
    Resolves the destination directory for optimized sheets.
    Always creates public/mascots/sheets if it doesn't exist yet.
    """
    if custom_dest:
        dest = Path(custom_dest).resolve()
    else:
        dest = repo_root / "public" / "mascots" / "sheets"

    # Always ensure sheets folder exists
    dest.mkdir(parents=True, exist_ok=True)
    return dest


def extract_character_id(filename: str) -> str:
    base = Path(filename).stem
    for suffix in ["-directions", "-reactions", "_directions", "_reactions"]:
        if base.endswith(suffix):
            return base[: -len(suffix)]
    return base


def optimize_sheet(
    src_path: Path,
    dest_path: Path,
    quality: int = DEFAULT_QUALITY,
    alpha_quality: int = DEFAULT_ALPHA_QUALITY,
    method: int = DEFAULT_METHOD,
    clean_noise: int = DEFAULT_CLEAN_NOISE,
    dry_run: bool = False,
    allow_custom_size: bool = False,
) -> Dict[str, any]:
    """
    Optimizes a single sprite sheet image.
    Returns metrics dict.
    """
    orig_size = src_path.stat().st_size
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size

    if (w, h) != STANDARD_SHEET_SIZE and not allow_custom_size:
        print(f"  [WARN] {src_path.name}: Non-standard dimensions {w}x{h} (standard is 1080x1080).")

    arr = np.array(img)
    alpha = arr[:, :, 3]

    # Transparency cleanup: clamp sub-perceptual alpha haze to 0
    alpha_noise_count = 0
    if clean_noise > 0:
        noise_mask = (alpha > 0) & (alpha <= clean_noise)
        alpha_noise_count = int(np.sum(noise_mask))
        arr[noise_mask, 3] = 0

    # Clean dirty colors under transparent pixels
    trans_mask = arr[:, :, 3] == 0
    dirty_rgb_count = 0
    if np.any(trans_mask):
        dirty_rgb_count = len(np.unique(arr[trans_mask, :3], axis=0))
        # Zero out RGB of transparent pixels
        arr[trans_mask, :3] = 0

    opt_img = Image.fromarray(arr, mode="RGBA")
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    if dry_run:
        import io
        buf = io.BytesIO()
        opt_img.save(
            buf,
            format="WEBP",
            quality=quality,
            alpha_quality=alpha_quality,
            method=method,
        )
        opt_size = len(buf.getvalue())
    else:
        temp_dest = dest_path.with_suffix(".tmp.webp")
        opt_img.save(
            temp_dest,
            format="WEBP",
            quality=quality,
            alpha_quality=alpha_quality,
            method=method,
        )
        temp_dest.replace(dest_path)
        opt_size = dest_path.stat().st_size

    # Verification
    if not dry_run:
        with Image.open(dest_path) as verified_img:
            assert verified_img.mode == "RGBA", f"Mode mismatch: expected RGBA, got {verified_img.mode}"
            assert verified_img.size == (w, h), f"Size mismatch: expected {w}x{h}, got {verified_img.size}"
            varr = np.array(verified_img)
            valpha = varr[:, :, 3]
            transp_pct = float(np.sum(valpha == 0) / valpha.size * 100)
    else:
        transp_pct = float(np.sum(arr[:, :, 3] == 0) / arr[:, :, 3].size * 100)

    saved_bytes = orig_size - opt_size
    saved_pct = (saved_bytes / orig_size) * 100 if orig_size > 0 else 0

    return {
        "file": src_path.name,
        "src_path": src_path,
        "dest_path": dest_path,
        "orig_size": orig_size,
        "opt_size": opt_size,
        "saved_bytes": saved_bytes,
        "saved_pct": saved_pct,
        "transp_pct": transp_pct,
        "cleaned_noise_pixels": alpha_noise_count,
        "cleaned_dirty_colors": dirty_rgb_count,
    }


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Optimize mascot sprite sheets from raw/ to sheets/ with lossless alpha and high WebP compression."
    )
    parser.add_argument(
        "--src",
        "-s",
        type=str,
        default=None,
        help="Source directory or specific sprite sheet file (default: auto-detected public/mascots/raw).",
    )
    parser.add_argument(
        "--dest",
        "-d",
        type=str,
        default=None,
        help="Destination directory for optimized sheets (default: public/mascots/sheets, created if missing).",
    )
    parser.add_argument(
        "--character",
        "-c",
        type=str,
        default=None,
        help="Optimize only sheets matching this character ID (e.g., 'asta' or 'tanjiro').",
    )
    parser.add_argument(
        "--quality",
        "-q",
        type=int,
        default=DEFAULT_QUALITY,
        help=f"WebP lossy color quality from 1 to 100 (default: {DEFAULT_QUALITY}).",
    )
    parser.add_argument(
        "--alpha-quality",
        "-aq",
        type=int,
        default=DEFAULT_ALPHA_QUALITY,
        help=f"WebP alpha quality from 1 to 100 (default: {DEFAULT_ALPHA_QUALITY} for lossless alpha).",
    )
    parser.add_argument(
        "--method",
        "-m",
        type=int,
        default=DEFAULT_METHOD,
        help=f"WebP compression effort from 0 to 6 (default: {DEFAULT_METHOD} for maximum search).",
    )
    parser.add_argument(
        "--clean-noise",
        "-cn",
        type=int,
        default=DEFAULT_CLEAN_NOISE,
        help=f"Alpha noise cutoff: pixels with alpha <= this value are zeroed (default: {DEFAULT_CLEAN_NOISE}).",
    )
    parser.add_argument(
        "--move",
        action="store_true",
        help="Move raw source files to archive directory upon successful optimization and verification.",
    )
    parser.add_argument(
        "--archive-dir",
        type=str,
        default=None,
        help="Directory to move raw files into when --move is enabled (default: <src>/processed).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the optimization and report savings without writing output or moving files.",
    )
    parser.add_argument(
        "--allow-custom-size",
        action="store_true",
        help="Allow non-1080x1080 sheets without raising dimension warnings.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print detailed information for each sheet processed.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_arguments()
    repo_root = Path.cwd()

    # Resolve and ensure source and destination directories exist
    src_target = resolve_src_dir(repo_root, args.src)
    dest_dir = resolve_dest_dir(repo_root, args.dest)

    # Collect target files
    files_to_process: List[Path] = []
    if src_target.is_file():
        files_to_process = [src_target]
        src_dir = src_target.parent
    else:
        src_dir = src_target
        valid_extensions = {".webp", ".png", ".jpg", ".jpeg"}
        for f in sorted(src_dir.iterdir()):
            if f.is_file() and f.suffix.lower() in valid_extensions:
                # Ignore hidden or temporary files
                if f.name.startswith(".") or ".tmp." in f.name:
                    continue
                if args.character:
                    char_id = extract_character_id(f.name)
                    if char_id.lower() != args.character.lower():
                        continue
                files_to_process.append(f)

    if not files_to_process:
        filter_msg = f" matching character '{args.character}'" if args.character else ""
        print(f"No mascot sheets found in '{src_dir}'{filter_msg}.")
        print("Drop unoptimized sheets into that directory or provide --src <path>.")
        return 0

    archive_path = None
    if args.move and not args.dry_run:
        archive_path = Path(args.archive_dir).resolve() if args.archive_dir else (src_dir / "processed")
        for source in files_to_process:
            destination = archive_path / source.name
            if destination.exists() or destination.is_symlink():
                print(f"  [ERROR] Archive destination already exists: {destination}")
                return 2

    mode_label = "[DRY-RUN] " if args.dry_run else ""
    print(f"{mode_label}Mascot Sprite Sheet Optimizer")
    print(f"Source (raw)       : {src_dir}")
    print(f"Destination (sheets): {dest_dir}")
    print(f"Parameters         : Quality={args.quality}, AlphaQuality={args.alpha_quality}, Method={args.method}, CleanNoise<={args.clean_noise}")
    print(f"Files found        : {len(files_to_process)}")
    print("-" * 80)

    start_time = time.time()
    results: List[Dict[str, any]] = []
    total_orig = 0
    total_opt = 0

    for idx, fpath in enumerate(files_to_process, 1):
        target_name = fpath.stem + ".webp"
        dest_file = dest_dir / target_name

        try:
            res = optimize_sheet(
                src_path=fpath,
                dest_path=dest_file,
                quality=args.quality,
                alpha_quality=args.alpha_quality,
                method=args.method,
                clean_noise=args.clean_noise,
                dry_run=args.dry_run,
                allow_custom_size=args.allow_custom_size,
            )
            results.append(res)
            total_orig += res["orig_size"]
            total_opt += res["opt_size"]

            diff_kb = res["saved_bytes"] / 1024
            orig_kb = res["orig_size"] / 1024
            opt_kb = res["opt_size"] / 1024
            pct = res["saved_pct"]

            print(
                f"[{idx:2d}/{len(files_to_process):2d}] {fpath.name:28} : "
                f"{orig_kb:6.1f}KB -> {opt_kb:6.1f}KB ({pct:+5.1f}%, {diff_kb:+5.1f}KB) | "
                f"Transp: {res['transp_pct']:4.1f}%"
            )

            if args.verbose:
                print(
                    f"       Cleaned {res['cleaned_noise_pixels']:,} noise pixels, "
                    f"zeroed {res['cleaned_dirty_colors']:,} hidden colors."
                )

        except Exception as ex:
            print(f"  [ERROR] Failed to process {fpath.name}: {ex}")
            return 2

    # Move raw files if requested
    if archive_path is not None:
        archive_path.mkdir(parents=True, exist_ok=True)
        print(f"\nMoving processed raw files to archive: {archive_path}")
        for res in results:
            src = res["src_path"]
            if src.is_file():
                dest_archive = archive_path / src.name
                if dest_archive.exists() or dest_archive.is_symlink():
                    print(f"  [ERROR] Archive destination already exists: {dest_archive}")
                    return 2
                shutil.move(str(src), str(dest_archive))
                if args.verbose:
                    print(f"  Archived: {src.name} -> {dest_archive}")

    elapsed = time.time() - start_time
    total_saved = total_orig - total_opt
    total_pct = (total_saved / total_orig * 100) if total_orig > 0 else 0

    print("=" * 80)
    print("Summary:")
    print(f"  Files processed    : {len(results)}")
    print(f"  Output directory   : {dest_dir}")
    print(f"  Total original     : {total_orig / (1024 * 1024):.2f} MB ({total_orig:,} bytes)")
    print(f"  Total optimized    : {total_opt / (1024 * 1024):.2f} MB ({total_opt:,} bytes)")
    print(f"  Total space saved  : {total_saved / (1024 * 1024):.2f} MB ({total_pct:.1f}% reduction)")
    print(f"  Execution time     : {elapsed:.2f} seconds")
    print("=" * 80)

    return 0


if __name__ == "__main__":
    sys.exit(main())
