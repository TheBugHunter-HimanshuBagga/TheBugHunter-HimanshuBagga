#!/usr/bin/env python3
"""Generate a PNG portrait as fallback for GitHub."""
import numpy as np
from PIL import Image
from pathlib import Path

img = Image.open("assets/photo-ready.png").convert("L")
w, h = img.size
scale = 600 / w
new_w, new_h = int(w * scale), int(h * scale)
img = img.resize((new_w, new_h), Image.LANCZOS)

arr = np.array(img)
bg = np.full_like(arr, 13)
mask = arr < 230

final = np.zeros((new_h, new_w, 3), dtype=np.uint8)
final[:,:,0] = 28
final[:,:,1] = 126
final[:,:,2] = 214
alpha = (255 - arr.astype(float)) / 255.0
final = (final * alpha[:,:,np.newaxis] + bg[:,:,np.newaxis] * (1 - alpha[:,:,np.newaxis])).astype(np.uint8)

Image.fromarray(final).save("portrait.png", "PNG")
sz = Path("portrait.png").stat().st_size // 1024
print(f"Written: portrait.png ({sz} KB)")
