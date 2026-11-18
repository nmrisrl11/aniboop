#!/usr/bin/env python3
"""
Unit and integration tests for Mascot Sprite Sheet Optimizer
"""

import os
import shutil
import tempfile
import unittest
from pathlib import Path
from PIL import Image
import numpy as np

from optimize import optimize_sheet, extract_character_id, resolve_dest_dir, resolve_src_dir


class TestOptimizer(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.src_dir = Path(self.test_dir) / "public" / "mascots" / "raw"
        self.dest_dir = Path(self.test_dir) / "public" / "mascots" / "sheets"
        self.src_dir.mkdir(parents=True)

        # Create a synthetic 1080x1080 test sheet resembling a mascot
        arr = np.zeros((1080, 1080, 4), dtype=np.uint8)

        # Opaque circle in center tile
        yy, xx = np.ogrid[:1080, :1080]
        circle_mask = ((xx - 540) ** 2 + (yy - 540) ** 2) <= (100 ** 2)
        arr[circle_mask, 0] = 200
        arr[circle_mask, 1] = 100
        arr[circle_mask, 2] = 50
        arr[circle_mask, 3] = 255

        # Dirty transparent pixels in top-left region: alpha is 0, but RGB contains random junk
        arr[:100, :100, 0] = 123
        arr[:100, :100, 1] = 234
        arr[:100, :100, 2] = 45
        arr[:100, :100, 3] = 0

        # Sub-perceptual alpha haze
        arr[100:150, 100:150, 3] = 1

        self.sample_img_path = self.src_dir / "testchar-directions.png"
        img = Image.fromarray(arr, mode="RGBA")
        img.save(self.sample_img_path)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_extract_character_id(self):
        self.assertEqual(extract_character_id("asta-directions.webp"), "asta")
        self.assertEqual(extract_character_id("naruto-reactions.png"), "naruto")
        self.assertEqual(extract_character_id("custom_id.webp"), "custom_id")

    def test_optimization_cleans_dirty_pixels_and_noise(self):
        out_file = self.dest_dir / "testchar-directions.webp"
        res = optimize_sheet(
            src_path=self.sample_img_path,
            dest_path=out_file,
            quality=80,
            alpha_quality=100,
            clean_noise=1,
            dry_run=False,
        )

        self.assertTrue(out_file.exists())
        self.assertGreater(res["cleaned_dirty_colors"], 0)
        self.assertGreater(res["cleaned_noise_pixels"], 0)

        # Verify output
        with Image.open(out_file) as dec:
            self.assertEqual(dec.size, (1080, 1080))
            self.assertEqual(dec.mode, "RGBA")
            darr = np.array(dec)
            # In the top-left transparent region far from the character, RGB must be 0
            self.assertEqual(np.max(darr[:50, :50, :3]), 0)
            # And alpha must be 0
            self.assertEqual(np.max(darr[:50, :50, 3]), 0)

    def test_resolve_dest_dir_creates_missing_sheets_folder(self):
        fresh_repo = Path(self.test_dir) / "fresh_project"
        fresh_repo.mkdir()
        # Verify sheets directory does NOT exist initially
        expected_sheets = fresh_repo / "public" / "mascots" / "sheets"
        self.assertFalse(expected_sheets.exists())

        # Calling resolve_dest_dir should automatically create it
        created_dest = resolve_dest_dir(fresh_repo)
        self.assertEqual(created_dest, expected_sheets)
        self.assertTrue(expected_sheets.exists())

    def test_resolve_src_dir_creates_missing_raw_folder(self):
        fresh_repo = Path(self.test_dir) / "fresh_project_2"
        fresh_repo.mkdir()
        expected_raw = fresh_repo / "public" / "mascots" / "raw"
        self.assertFalse(expected_raw.exists())

        created_src = resolve_src_dir(fresh_repo)
        self.assertEqual(created_src, expected_raw)
        self.assertTrue(expected_raw.exists())


if __name__ == "__main__":
    unittest.main()
