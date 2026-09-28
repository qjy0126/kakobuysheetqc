#!/usr/bin/env python3
"""Resize product images to 560px and convert JPEG to WebP."""
from concurrent.futures import ProcessPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/cusky/Desktop/kakobuy/img/products")
MAX_SIDE = 560
QUALITY = 72
METHOD = 4


def convert(path_str):
    src = Path(path_str)
    dest = src.with_suffix(".webp")
    orig = src.stat().st_size
    try:
        im = Image.open(src)
        im.load()
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        if max(im.size) > MAX_SIDE:
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
        buf = BytesIO()
        im.save(buf, format="WEBP", quality=QUALITY, method=METHOD)
        data = buf.getvalue()
        dest.write_bytes(data)
        return orig, len(data), "ok"
    except Exception as e:
        return orig, orig, type(e).__name__


def main():
    files = [str(p) for p in ROOT.glob("*.jpg")]
    before = after = ok = errors = 0
    with ProcessPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(convert, f) for f in files]
        for i, fut in enumerate(as_completed(futs), 1):
            b, a, st = fut.result()
            before += b
            if st == "ok":
                after += a
                ok += 1
            else:
                after += b
                errors += 1
            if i % 1500 == 0 or i == len(files):
                print(
                    f"{i}/{len(files)} ok={ok} errors={errors} "
                    f"webp_mb={after/1024/1024:.1f}",
                    flush=True,
                )
    print("jpg_mb", round(before / 1024 / 1024, 1))
    print("webp_mb", round(after / 1024 / 1024, 1))
    print("ok", ok, "errors", errors)
    if before:
        print("saved_pct", round(100 * (1 - after / before), 1))


if __name__ == "__main__":
    main()
