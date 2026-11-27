#!/usr/bin/env python3
"""Synchronize all AniBoop mascot WebP assets (sheets, previews, gallery-sheets) to Cloudflare R2."""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from catalog import CATALOG_DIR, load_catalog, sync_all_versions

ROOT = Path(__file__).resolve().parents[1]
MASCOTS_DIR = ROOT / "public" / "mascots"

CACHE_CONTROL_IMMUTABLE = "public, max-age=31536000, immutable"
ASSET_TIERS = ("sheets", "previews", "gallery-sheets")
MAX_WORKERS = 12


def load_env() -> Dict[str, str]:
    """Load environment variables from .env, .env.local, and os.environ."""
    env: Dict[str, str] = {}
    for env_file in [ROOT / ".env", ROOT / ".env.local"]:
        if env_file.is_file():
            try:
                for line in env_file.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key:
                        env[key] = val
            except Exception:
                pass
    for k, v in os.environ.items():
        env[k] = v
    return env


def get_r2_client() -> Tuple[Optional[object], Optional[str], Optional[str]]:
    """Create a boto3 S3 client configured for Cloudflare R2."""
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        return None, None, "boto3 is not installed. Run 'python -m pip install boto3' to enable R2 sync."

    env = load_env()
    account_id = env.get("R2_ACCOUNT_ID")
    access_key = env.get("R2_ACCESS_KEY_ID")
    secret_key = env.get("R2_SECRET_ACCESS_KEY")
    bucket_name = env.get("R2_BUCKET_NAME", "aniboop-assets")

    if not account_id or not access_key or not secret_key:
        missing = []
        if not account_id:
            missing.append("R2_ACCOUNT_ID")
        if not access_key:
            missing.append("R2_ACCESS_KEY_ID")
        if not secret_key:
            missing.append("R2_SECRET_ACCESS_KEY")
        return None, None, f"Missing R2 credentials in .env.local: {', '.join(missing)}"

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4", max_pool_connections=MAX_WORKERS + 4),
    )
    return client, bucket_name, None


def character_asset_paths(character_id: str, assets_dir: Path = MASCOTS_DIR) -> List[Tuple[Path, str]]:
    """Return all five (local_path, remote_key) pairs for a character."""
    return [
        (assets_dir / "previews" / f"{character_id}.webp", f"previews/{character_id}.webp"),
        (
            assets_dir / "gallery-sheets" / f"{character_id}-directions.webp",
            f"gallery-sheets/{character_id}-directions.webp",
        ),
        (
            assets_dir / "gallery-sheets" / f"{character_id}-reactions.webp",
            f"gallery-sheets/{character_id}-reactions.webp",
        ),
        (assets_dir / "sheets" / f"{character_id}-directions.webp", f"sheets/{character_id}-directions.webp"),
        (assets_dir / "sheets" / f"{character_id}-reactions.webp", f"sheets/{character_id}-reactions.webp"),
    ]


def compute_character_version(character_id: str, assets_dir: Path = MASCOTS_DIR) -> str:
    """Compute a stable 8-char SHA-256 revision hash from all five WebP files of a character."""
    digest = hashlib.sha256()
    for local_path, remote_key in character_asset_paths(character_id, assets_dir):
        if not local_path.is_file():
            raise FileNotFoundError(f"Missing asset for version hash: {local_path}")
        digest.update(remote_key.encode("utf-8"))
        digest.update(b"\0")
        digest.update(local_path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()[:8]


def sync_catalog_versions(assets_dir: Path = MASCOTS_DIR) -> int:
    """Compute and persist per-character content revision hashes ('v') in src/data/characters/."""
    if not CATALOG_DIR.is_dir():
        print(f"[R2 ERROR] Catalog directory not found: {CATALOG_DIR}")
        return 1

    updated, total = sync_all_versions(lambda character_id: compute_character_version(character_id, assets_dir))
    print(f"Updated version hashes for {updated}/{total} characters in {CATALOG_DIR.relative_to(ROOT)}.")
    return 0


def upload_single_file(
    s3_client,
    bucket: str,
    local_path: Path,
    remote_key: str,
    dry_run: bool = False,
    quiet: bool = False,
) -> bool:
    """Upload a single file to R2 with immutable caching headers."""
    if not local_path.is_file():
        if not quiet:
            print(f"[R2] File not found: {local_path}")
        return False

    if dry_run:
        if not quiet:
            print(f"[R2 DRY-RUN] Would upload {remote_key}")
        return True

    try:
        body = local_path.read_bytes()
        s3_client.put_object(
            Bucket=bucket,
            Key=remote_key,
            Body=body,
            ContentType="image/webp",
            CacheControl=CACHE_CONTROL_IMMUTABLE,
        )
        if not quiet:
            size_kb = len(body) / 1024
            print(f"[R2] Uploaded {remote_key} ({size_kb:.1f} KB)")
        return True
    except Exception as exc:
        if not quiet:
            print(f"[R2 ERROR] Failed uploading {remote_key}: {exc}")
        return False


def has_r2_credentials() -> bool:
    """Return True if R2 upload credentials are configured in the environment or .env.local."""
    env = load_env()
    return bool(env.get("R2_ACCOUNT_ID") and env.get("R2_ACCESS_KEY_ID") and env.get("R2_SECRET_ACCESS_KEY"))


def upload_character_assets(
    character_id: str,
    tiers: Tuple[str, ...] = ASSET_TIERS,
    assets_dir: Path = MASCOTS_DIR,
    dry_run: bool = False,
    quiet: bool = False,
) -> bool:
    """Upload all configured asset tiers (up to 5 WebPs) for a single character."""
    client, bucket, err = get_r2_client()
    if err:
        if not quiet:
            print(f"[R2 WARNING] {err}")
        return False

    tier_set = set(tiers)
    pairs = [
        (local_path, remote_key)
        for local_path, remote_key in character_asset_paths(character_id, assets_dir)
        if remote_key.split("/", 1)[0] in tier_set
    ]

    success = True
    for local_path, remote_key in pairs:
        if not upload_single_file(client, bucket, local_path, remote_key, dry_run=dry_run, quiet=quiet):
            success = False

    return success


def list_remote_objects(s3_client, bucket: str, tiers: Tuple[str, ...] = ASSET_TIERS) -> Dict[str, int]:
    """Fetch all remote object keys and sizes for the requested tiers."""
    remote_objects: Dict[str, int] = {}
    paginator = s3_client.get_paginator("list_objects_v2")
    for tier in tiers:
        for page in paginator.paginate(Bucket=bucket, Prefix=f"{tier}/"):
            for obj in page.get("Contents", []):
                remote_objects[obj["Key"]] = obj["Size"]
    return remote_objects


def sync_all(
    tiers: Tuple[str, ...] = ASSET_TIERS,
    dry_run: bool = False,
    force: bool = False,
    quiet: bool = False,
) -> int:
    """Audit and upload any missing or changed mascot WebPs across selected tiers to R2."""
    client, bucket, err = get_r2_client()
    if err:
        print(f"[R2 ERROR] {err}")
        return 1

    print(f"Scanning remote bucket '{bucket}' for tiers: {', '.join(tiers)}...")
    remote_objects = list_remote_objects(client, bucket, tiers)
    print(f"Found {len(remote_objects)} remote objects.")

    to_upload: List[Tuple[Path, str]] = []
    local_count = 0
    for tier in tiers:
        tier_dir = MASCOTS_DIR / tier
        if not tier_dir.is_dir():
            print(f"[R2 WARNING] Local directory does not exist, skipping: {tier_dir}")
            continue
        files = sorted(tier_dir.glob("*.webp"))
        local_count += len(files)
        for local_path in files:
            remote_key = f"{tier}/{local_path.name}"
            if force or remote_key not in remote_objects or remote_objects[remote_key] != local_path.stat().st_size:
                to_upload.append((local_path, remote_key))

    print(f"Found {local_count} local WebPs across {', '.join(tiers)}.")

    if not to_upload:
        print("Everything is in sync! All local mascot assets match R2.")
        return 0

    print(f"{len(to_upload)} asset(s) to upload (concurrency={MAX_WORKERS})...")
    if dry_run:
        for _, remote_key in to_upload[:25]:
            print(f"[R2 DRY-RUN] Would upload {remote_key}")
        if len(to_upload) > 25:
            print(f"[R2 DRY-RUN] ... and {len(to_upload) - 25} more.")
        return 0

    uploaded = 0
    failed = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(upload_single_file, client, bucket, local_path, remote_key, False, True): remote_key
            for local_path, remote_key in to_upload
        }
        for future in as_completed(futures):
            remote_key = futures[future]
            if future.result():
                uploaded += 1
                if not quiet and (uploaded % 50 == 0 or uploaded == len(to_upload)):
                    print(f"[R2] Progress: {uploaded}/{len(to_upload)} uploaded...")
            else:
                failed += 1
                print(f"[R2 ERROR] Failed: {remote_key}")

    print(f"Finished! Uploaded {uploaded}/{len(to_upload)} assets to R2 ({failed} failed).")
    return 0 if failed == 0 else 1


def check_catalog(tiers: Tuple[str, ...] = ASSET_TIERS) -> int:
    """Verify that every character in src/data/characters/ has all expected assets on R2."""
    client, bucket, err = get_r2_client()
    if err:
        print(f"[R2 ERROR] {err}")
        return 1

    if not CATALOG_DIR.is_dir():
        print(f"[R2 ERROR] Catalog directory not found: {CATALOG_DIR}")
        return 1

    catalog = load_catalog()
    remote_objects = list_remote_objects(client, bucket, tiers)
    tier_set = set(tiers)

    missing: List[str] = []
    total_expected = 0
    for item in catalog:
        for _, remote_key in character_asset_paths(item["id"]):
            if remote_key.split("/", 1)[0] not in tier_set:
                continue
            total_expected += 1
            if remote_key not in remote_objects:
                missing.append(remote_key)

    present = total_expected - len(missing)
    print(
        f"Catalog audit ({', '.join(tiers)}): {present}/{total_expected} assets present on R2 "
        f"({len(catalog)} characters)."
    )
    if missing:
        print(f"\nMissing {len(missing)} asset(s) on R2:")
        for key in missing[:20]:
            print(f"  - {key}")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more.")
        print("\nRun 'npm run mascot:sync-r2' to upload missing assets.")
        return 1

    print("All catalog characters have complete assets on Cloudflare R2!")
    return 0


def verify_cdn(
    tiers: Tuple[str, ...] = ASSET_TIERS,
    character_id: Optional[str] = None,
    assets_dir: Path = MASCOTS_DIR,
) -> int:
    """Verify that the public R2 CDN serves bytes matching local WebPs for catalog ?v=<hash> URLs."""
    env = load_env()
    base_url = (env.get("NEXT_PUBLIC_R2_ASSETS_URL") or env.get("NEXT_PUBLIC_R2_URL") or "").strip().rstrip("/")
    if not base_url:
        print("[R2 ERROR] NEXT_PUBLIC_R2_ASSETS_URL is not configured.")
        return 1

    if not CATALOG_DIR.is_dir():
        print(f"[R2 ERROR] Catalog directory not found: {CATALOG_DIR}")
        return 1

    catalog = load_catalog()
    if character_id:
        catalog = [entry for entry in catalog if entry["id"] == character_id]
        if not catalog:
            print(f"[R2 ERROR] Character '{character_id}' not found in {CATALOG_DIR.relative_to(ROOT)}.")
            return 1

    tier_set = set(tiers)
    checks: List[Tuple[Path, str, str]] = []
    for entry in catalog:
        version = entry.get("v")
        for local_path, remote_key in character_asset_paths(entry["id"], assets_dir):
            if remote_key.split("/", 1)[0] not in tier_set:
                continue
            url = f"{base_url}/{remote_key}"
            if version:
                url = f"{url}?v={version}"
            checks.append((local_path, remote_key, url))

    def _check_one(item: Tuple[Path, str, str]) -> Tuple[str, str, Optional[str]]:
        local_path, remote_key, url = item
        if not local_path.is_file():
            return remote_key, url, f"missing local file ({local_path})"
        local_sha = hashlib.sha256(local_path.read_bytes()).hexdigest()[:8]
        req = urllib.request.Request(url, headers={"User-Agent": "AniBoop-CDN-Check/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                remote_sha = hashlib.sha256(resp.read()).hexdigest()[:8]
                cf_status = resp.headers.get("CF-Cache-Status", "unknown")
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            return remote_key, url, f"request failed: {exc}"
        if remote_sha != local_sha:
            return remote_key, url, f"stale CDN bytes (cdn={remote_sha}, local={local_sha}, CF-Cache-Status={cf_status})"
        return remote_key, url, None

    failures: List[Tuple[str, str, str]] = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        for remote_key, url, error in executor.map(_check_one, checks):
            if error:
                failures.append((remote_key, url, error))

    fresh = len(checks) - len(failures)
    print(f"CDN verification ({', '.join(tiers)}): {fresh}/{len(checks)} URLs match local WebPs.")
    if failures:
        print(f"\nMismatched or unreachable CDN URLs ({len(failures)}):")
        for _, url, error in failures:
            print(f"  - {url} -> {error}")
        print(
            "\nIf R2 already holds the new files, purge those URLs in Cloudflare Dashboard "
            "(Caching -> Configuration -> Purge Cache)."
        )
        return 1

    print("All checked public CDN URLs match local WebPs byte for byte!")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character", help="Specific character ID to upload across selected tiers")
    parser.add_argument(
        "--tier",
        choices=("all", *ASSET_TIERS),
        default="all",
        help="Restrict operation to one asset tier (default: all)",
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=MASCOTS_DIR,
        help="Directory containing previews/, gallery-sheets/, and sheets/ (default: public/mascots)",
    )
    parser.add_argument("--check", action="store_true", help="Audit catalog characters against R2 without uploading")
    parser.add_argument(
        "--verify-cdn",
        action="store_true",
        help="Fetch public ?v=<hash> CDN URLs and verify their bytes match local WebPs",
    )
    parser.add_argument("--sync-versions", action="store_true", help="Compute and update 'v' hashes in src/data/characters/")
    parser.add_argument("--force", action="store_true", help="Re-upload files even if sizes match on R2")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded without uploading")
    parser.add_argument(
        "--skip-if-unconfigured",
        action="store_true",
        help="Exit 0 with a warning instead of failing when R2 credentials are not set",
    )
    args = parser.parse_args()

    tiers = ASSET_TIERS if args.tier == "all" else (args.tier,)

    if args.sync_versions:
        sys.exit(sync_catalog_versions(assets_dir=args.assets_dir))

    if args.verify_cdn:
        sys.exit(verify_cdn(tiers=tiers, character_id=args.character, assets_dir=args.assets_dir))

    if args.check:
        sys.exit(check_catalog(tiers))

    if args.character:
        if args.skip_if_unconfigured and not has_r2_credentials():
            print("[R2 WARNING] R2 credentials are not configured; skipping R2 upload.")
            sys.exit(0)
        success = upload_character_assets(args.character, tiers=tiers, assets_dir=args.assets_dir, dry_run=args.dry_run)
        sys.exit(0 if success else 1)

    sys.exit(sync_all(tiers=tiers, dry_run=args.dry_run, force=args.force))


if __name__ == "__main__":
    main()
