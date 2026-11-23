#!/usr/bin/env python3
"""Synchronize AniBoop 1080x1080 master sheets to Cloudflare R2 object storage."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
SHEETS_DIR = ROOT / "public" / "mascots" / "sheets"
CATALOG_PATH = ROOT / "src" / "data" / "characters.json"


def load_env() -> Dict[str, str]:
    """Load environment variables from .env.local, .env, and os.environ."""
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
    # System env overrides file env
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
        config=Config(signature_version="s3v4"),
    )
    return client, bucket_name, None


def upload_single_file(
    s3_client,
    bucket: str,
    local_path: Path,
    remote_key: str,
    dry_run: bool = False,
    quiet: bool = False,
) -> bool:
    """Upload a single file to R2 with appropriate headers."""
    if not local_path.is_file():
        if not quiet:
            print(f"[R2] File not found: {local_path}")
        return False

    if dry_run:
        print(f"[R2 DRY-RUN] Would upload {local_path.name} -> {remote_key}")
        return True

    try:
        with open(local_path, "rb") as f:
            s3_client.put_object(
                Bucket=bucket,
                Key=remote_key,
                Body=f,
                ContentType="image/webp",
                CacheControl="public, max-age=31536000, immutable",
            )
        if not quiet:
            size_kb = local_path.stat().st_size / 1024
            print(f"[R2] Uploaded {local_path.name} ({size_kb:.1f} KB) -> {remote_key}")
        return True
    except Exception as exc:
        if not quiet:
            print(f"[R2 ERROR] Failed uploading {local_path.name}: {exc}")
        return False


def upload_character_sheets(
    character_id: str,
    dry_run: bool = False,
    quiet: bool = False,
) -> bool:
    """Upload directions and reactions 1080 sheets for a single character."""
    client, bucket, err = get_r2_client()
    if err:
        if not quiet:
            print(f"[R2 WARNING] {err}")
        return False

    success = True
    for kind in ("directions", "reactions"):
        filename = f"{character_id}-{kind}.webp"
        local_path = SHEETS_DIR / filename
        remote_key = f"sheets/{filename}"
        if not upload_single_file(client, bucket, local_path, remote_key, dry_run=dry_run, quiet=quiet):
            success = False

    return success


def list_remote_sheets(s3_client, bucket: str) -> Dict[str, int]:
    """Fetch all object keys and sizes under sheets/ in the R2 bucket."""
    remote_objects: Dict[str, int] = {}
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix="sheets/"):
        for obj in page.get("Contents", []):
            remote_objects[obj["Key"]] = obj["Size"]
    return remote_objects


def sync_all(dry_run: bool = False, force: bool = False) -> int:
    """Audit and upload any missing or changed 1080 sheets to R2."""
    client, bucket, err = get_r2_client()
    if err:
        print(f"[R2 ERROR] {err}")
        return 1

    if not SHEETS_DIR.is_dir():
        print(f"[R2 ERROR] Sheets directory does not exist: {SHEETS_DIR}")
        return 1

    print(f"Scanning remote bucket '{bucket}' under 'sheets/'...")
    remote_objects = list_remote_sheets(client, bucket)
    print(f"Found {len(remote_objects)} objects in R2 bucket.")

    local_files = sorted(SHEETS_DIR.glob("*.webp"))
    print(f"Found {len(local_files)} local 1080 master sheets in {SHEETS_DIR.name}/.\n")

    to_upload: List[Tuple[Path, str]] = []
    for local_path in local_files:
        remote_key = f"sheets/{local_path.name}"
        if force or remote_key not in remote_objects:
            to_upload.append((local_path, remote_key))
        elif remote_objects[remote_key] != local_path.stat().st_size:
            to_upload.append((local_path, remote_key))

    if not to_upload:
        print("Everything is in sync! All local 1080 sheets match R2.")
        return 0

    print(f"{len(to_upload)} sheet(s) to upload:\n")
    uploaded = 0
    for local_path, remote_key in to_upload:
        if upload_single_file(client, bucket, local_path, remote_key, dry_run=dry_run):
            uploaded += 1

    if dry_run:
        print(f"\n[DRY-RUN] Finished. {uploaded}/{len(to_upload)} sheets simulated.")
    else:
        print(f"\nFinished! Successfully uploaded {uploaded}/{len(to_upload)} sheets to R2.")

    return 0


def check_catalog() -> int:
    """Verify that every character in characters.json has both 1080 sheets on R2."""
    client, bucket, err = get_r2_client()
    if err:
        print(f"[R2 ERROR] {err}")
        return 1

    import json

    if not CATALOG_PATH.is_file():
        print(f"[R2 ERROR] Catalog not found: {CATALOG_PATH}")
        return 1

    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    remote_objects = list_remote_sheets(client, bucket)

    missing: List[str] = []
    for item in catalog:
        cid = item["id"]
        for kind in ("directions", "reactions"):
            key = f"sheets/{cid}-{kind}.webp"
            if key not in remote_objects:
                missing.append(key)

    total_characters = len(catalog)
    total_expected = total_characters * 2
    present = total_expected - len(missing)

    print(f"Catalog audit: {present}/{total_expected} master sheets present on R2 ({total_characters} characters).")
    if missing:
        print(f"\nMissing {len(missing)} sheet(s) on R2:")
        for key in missing[:20]:
            print(f"  - {key}")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more.")
        print("\nRun 'npm run mascot:sync-r2' to upload missing sheets.")
        return 1

    print("All catalog characters have complete 1080 HD sheets on Cloudflare R2!")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character", help="Specific character ID to upload (both directions and reactions)")
    parser.add_argument("--check", action="store_true", help="Audit catalog characters against R2 without uploading")
    parser.add_argument("--force", action="store_true", help="Re-upload files even if sizes match on R2")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded without uploading")
    args = parser.parse_args()

    if args.check:
        sys.exit(check_catalog())

    if args.character:
        success = upload_character_sheets(args.character, dry_run=args.dry_run)
        sys.exit(0 if success else 1)

    sys.exit(sync_all(dry_run=args.dry_run, force=args.force))


if __name__ == "__main__":
    main()
