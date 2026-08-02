#!/usr/bin/env python3
"""Clean up a source photo for ASCII portrait conversion.

Steps:
  1. Remove background with rembg
  2. Apply CLAHE for even lighting
  3. Composite onto white canvas
  4. Crop to subject bounding box

Usage:
  python tools/clean_photo.py <input_path>
  writes assets/photo-ready.png
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

try:
    from rembg import remove as rembg_remove
except ImportError:
    rembg_remove = None


def clean_photo(input_path: str, output_path: str = "assets/photo-ready.png") -> str:
    src = Image.open(input_path).convert("RGBA")

    # 1. Background removal
    if rembg_remove is not None:
        print("  Removing background...")
        result = rembg_remove(src)
        rgba = result.convert("RGBA")
    else:
        print("  rembg not installed, skipping background removal")
        rgba = src.convert("RGBA")

    # 2. Extract alpha mask
    alpha = np.array(rgba.split()[-1])

    # 3. Convert to grayscale for CLAHE
    gray = cv2.cvtColor(np.array(rgba.convert("RGB")), cv2.COLOR_RGB2GRAY)

    # 4. CLAHE for even lighting
    print("  Applying CLAHE...")
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 5. Composite onto white background
    white_bg = np.full_like(enhanced, 255)
    mask = alpha > 0
    composited = np.where(mask, enhanced, white_bg)

    # 6. Crop to bounding box of the subject
    coords = cv2.findNonZero(255 - composited)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        pad = 20
        y1 = max(0, y - pad)
        y2 = min(composited.shape[0], y + h + pad)
        x1 = max(0, x - pad)
        x2 = min(composited.shape[1], x + w + pad)
        composited = composited[y1:y2, x1:x2]

    # 7. Save
    out = Image.fromarray(composited)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path)
    print(f"  Saved: {output_path}")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/clean_photo.py <input_photo>")
        sys.exit(1)
    clean_photo(sys.argv[1])
