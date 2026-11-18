# Mascot Optimization Pipeline Specifications

The optimizer prepares sprite sheets as WebP using lossy color compression and full-quality alpha encoding after transparency cleanup.

---

## Standard Project Flow

```text
[Incoming Character Sheets]
          │
          ▼
    public/mascots/raw/
          │
          ▼
   optimize.py / $optimize-mascot
          │ (auto-creates destination if missing)
          ▼
   public/mascots/sheets/
          │
          ▼
   (Optional: --move raw files to archive/)
```

---

## The Problem with Raw AI/Chroma-Key Sprite Sheets

Raw sprite sheets generated via diffusion pipelines or chroma-key background removal suffer from two major compression penalties:

1. **Dirty Transparent Pixels (10,000+ invisible colors)**:
   Even when an image tool sets alpha to 0 for the background, the RGB channels still hold residual color values (diffusion noise, green/magenta spill, or anti-aliasing fragments). Because lossy WebP encodes the RGB plane using VP8 macroblocks, the encoder spends bits attempting to compress high-frequency background noise that the user will never see.

2. **Sub-perceptual Alpha Haze**:
   Keying filters often leave stray pixels with alpha between 1 and 5 (out of 255). An alpha of 1 is virtually invisible ($\sim 0.39\%$ opacity) but breaks clean tile bounds and complicates the entropy coding of the alpha stream.

---

## The Optimization Solution

```text
[Raw Image (PNG / WebP)]
          │
          ▼
┌───────────────────────────────────────┐
│ 1. Sub-Perceptual Alpha Clamping      │
│    alpha <= clean_noise -> alpha = 0  │
└──────────────────┬────────────────────┘
                   ▼
┌───────────────────────────────────────┐
│ 2. Dirty Transparent RGB Zeroing      │
│    alpha == 0 -> RGB = (0, 0, 0)      │
└──────────────────┬────────────────────┘
                   ▼
┌───────────────────────────────────────┐
│ 3. Lossless Alpha Encoding            │
│    alpha_quality = 100                │
└──────────────────┬────────────────────┘
                   ▼
┌───────────────────────────────────────┐
│ 4. Exhaustive VP8 Search              │
│    method = 6, quality = 80           │
└──────────────────┬────────────────────┘
                   ▼
┌───────────────────────────────────────┐
│ 5. Automated Verification             │
│    Check source dimensions and RGBA      │
└──────────────────┬────────────────────┘
                   ▼
    public/mascots/sheets/{source-stem}.webp
```

---

## Technical Specifications

### 1. Auto-Creation of Missing Directories
```python
dest = repo_root / "public" / "mascots" / "sheets"
dest.mkdir(parents=True, exist_ok=True)
```
Guarantees seamless execution even on fresh project setups without manual folder bootstrapping.

### 2. Alpha Clamping (`clean_noise=1`)
```python
noise_mask = (alpha > 0) & (alpha <= clean_noise)
arr[noise_mask, 3] = 0
```
Clears boundary halos and isolated single-pixel dust on sheet perimeters.

### 3. RGB Zeroing Under Transparency
```python
trans_mask = arr[:, :, 3] == 0
arr[trans_mask, :3] = 0
```
Makes RGB values under fully transparent pixels uniform before encoding.

### 4. Lossless Alpha Channel (`alpha_quality=100`)
The default `alpha_quality=100` encodes the alpha channel after cleanup at full quality. Use `--clean-noise 0` to keep the original nonzero alpha values.

### 5. Search Effort (`method=6`)
`method` ranges from 0 (fastest) to 6 (highest effort). The optimizer uses method 6 and lossy color quality 80 by default.

---

## Checking output

Use `--dry-run` to estimate transfer savings for the actual source sheets. Inspect representative output at its intended display size to assess color fidelity.
