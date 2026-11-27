"""Shared reader and writer for AniBoop's per-series character catalog under src/data/characters/."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
CATALOG_DIR = ROOT / "src" / "data" / "characters"
CATALOG_INDEX = CATALOG_DIR / "index.ts"

_IMPORT_RE = re.compile(r'^import\s+[A-Za-z_$][A-Za-z0-9_$]*\s+from\s+"\.\/([a-z0-9-]+)\.json";$', re.MULTILINE)


def slugify_series(series: str) -> str:
    """Convert a display series title into a stable kebab-case filename stem."""
    cleaned = re.sub(r"['’]", "", series.strip().lower())
    slug = re.sub(r"[^a-z0-9]+", "-", cleaned).strip("-")
    if not slug:
        raise ValueError(f"Could not derive a valid filename slug from series {series!r}.")
    return slug


def slug_to_identifier(slug: str) -> str:
    """Convert a kebab-case slug into a valid camelCase TypeScript identifier."""
    parts = [part for part in slug.split("-") if part]
    ident = parts[0] + "".join(part.capitalize() for part in parts[1:])
    if ident[0].isdigit():
        ident = f"series{ident}"
    return ident


def read_index_slugs() -> List[str]:
    """Return the ordered series slugs registered in src/data/characters/index.ts."""
    if not CATALOG_INDEX.is_file():
        return []
    return _IMPORT_RE.findall(CATALOG_INDEX.read_text(encoding="utf-8"))


def series_file_paths() -> List[Path]:
    """Return all series JSON files in canonical index order (plus any unregistered files)."""
    if not CATALOG_DIR.is_dir():
        return []
    ordered: List[Path] = []
    seen = set()
    for slug in read_index_slugs():
        path = CATALOG_DIR / f"{slug}.json"
        if path.is_file():
            ordered.append(path)
            seen.add(path.name)
    for path in sorted(CATALOG_DIR.glob("*.json")):
        if path.name not in seen:
            ordered.append(path)
    return ordered


def catalog_snapshot() -> bytes:
    """Compute a deterministic digest of all catalog files to detect concurrent edits."""
    digest = hashlib.sha256()
    if CATALOG_INDEX.is_file():
        digest.update(b"index.ts\0")
        digest.update(CATALOG_INDEX.read_bytes())
        digest.update(b"\0")
    for path in sorted(CATALOG_DIR.glob("*.json")):
        digest.update(path.name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.digest()


def load_catalog() -> List[Dict[str, str]]:
    """Load all characters across all per-series JSON files as flat {id, name, series, v?} dicts."""
    entries: List[Dict[str, str]] = []
    for path in series_file_paths():
        data = json.loads(path.read_text(encoding="utf-8"))
        series = data["series"]
        for character in data["characters"]:
            entry = {"id": character["id"], "name": character["name"], "series": series}
            if "v" in character:
                entry["v"] = character["v"]
            entries.append(entry)
    return entries


def find_character(character_id: str) -> Optional[Tuple[Path, Dict, int]]:
    """Find a character by ID and return (series_file_path, parsed_series_dict, character_index)."""
    for path in series_file_paths():
        data = json.loads(path.read_text(encoding="utf-8"))
        for index, character in enumerate(data["characters"]):
            if character["id"] == character_id:
                return path, data, index
    return None


def find_series_file(series: str) -> Optional[Path]:
    """Find the existing series JSON file matching the exact series display name."""
    for path in series_file_paths():
        data = json.loads(path.read_text(encoding="utf-8"))
        if data["series"] == series:
            return path
    return None


def format_series_json(data: Dict) -> str:
    """Serialize a series catalog JSON object with tab indentation and trailing LF."""
    return json.dumps(data, ensure_ascii=False, indent="\t") + "\n"


def render_index_ts(slugs: List[str]) -> str:
    """Generate src/data/characters/index.ts matching the repository's Oxfmt formatting."""
    imports = [f'import {slug_to_identifier(slug)} from "./{slug}.json";' for slug in slugs]
    members = [f"\t{slug_to_identifier(slug)}," for slug in slugs]
    lines = [
        *imports,
        "",
        "export type SeriesCharacter = {",
        "\tid: string;",
        "\tname: string;",
        "\tv?: string;",
        "};",
        "",
        "export type SeriesCatalog = {",
        "\tseries: string;",
        "\tcharacters: readonly SeriesCharacter[];",
        "};",
        "",
        "export const SERIES_CATALOGS: readonly SeriesCatalog[] = [",
        *members,
        "];",
        "",
    ]
    return "\n".join(lines)


def write_text_lf(path: Path, content: str) -> None:
    """Write UTF-8 text with LF line endings."""
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(content)


def stage_character_addition(entry: Dict[str, str], staging: Path) -> Tuple[Path, Path, Optional[Path]]:
    """
    Prepare staged updates for adding a new character entry.

    Returns (staged_series_json, target_series_json, optional_staged_index_ts).
    """
    character_record: Dict[str, str] = {"id": entry["id"], "name": entry["name"]}
    if "v" in entry:
        character_record["v"] = entry["v"]

    existing_path = find_series_file(entry["series"])
    if existing_path is not None:
        data = json.loads(existing_path.read_text(encoding="utf-8"))
        data["characters"] = [*data["characters"], character_record]
        staged_json = staging / existing_path.name
        write_text_lf(staged_json, format_series_json(data))
        return staged_json, existing_path, None

    slug = slugify_series(entry["series"])
    target_path = CATALOG_DIR / f"{slug}.json"
    if target_path.exists():
        raise ValueError(
            f"Series file {target_path.relative_to(ROOT)} already exists for a different series name."
        )
    data = {"series": entry["series"], "characters": [character_record]}
    staged_json = staging / target_path.name
    write_text_lf(staged_json, format_series_json(data))

    slugs = read_index_slugs()
    if slug not in slugs:
        slugs.append(slug)
    staged_index = staging / CATALOG_INDEX.name
    write_text_lf(staged_index, render_index_ts(slugs))
    return staged_json, target_path, staged_index


def update_character_version(character_id: str, new_version: str, staging: Path) -> Path:
    """Atomically update a character's 'v' hash in its series JSON file."""
    found = find_character(character_id)
    if found is None:
        raise ValueError(f"{character_id} is not in {CATALOG_DIR.relative_to(ROOT)}. Use mascot:add for new characters.")
    path, data, index = found
    data["characters"][index] = {**data["characters"][index], "v": new_version}
    staged_json = staging / path.name
    write_text_lf(staged_json, format_series_json(data))
    staged_json.replace(path)
    return path


def sync_all_versions(compute_version: Callable[[str], str]) -> Tuple[int, int]:
    """Recompute and persist 'v' hashes across all series JSON files. Returns (updated, total)."""
    updated = 0
    total = 0
    for path in series_file_paths():
        data = json.loads(path.read_text(encoding="utf-8"))
        file_changed = False
        for character in data["characters"]:
            total += 1
            version = compute_version(character["id"])
            if character.get("v") != version:
                character["v"] = version
                updated += 1
                file_changed = True
        if file_changed:
            write_text_lf(path, format_series_json(data))
    return updated, total
