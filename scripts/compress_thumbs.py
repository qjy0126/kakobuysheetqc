#!/usr/bin/env python3
"""Compress product WebP thumbs for the static site."""
from concurrent.futures import ProcessPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/cusky/Desktop/kakobuy/img/products")
MAX_SIDE = 560
QUALITY = 72


def compress(path_str):
    path = Path(path_str)
    orig = path.stat().st_size
    try:
        im = Image.open(path)
        im.load()
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        elif im.mode == "L":
            im = im.convert("RGB")
        if max(im.size) > MAX_SIDE:
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
        buf = BytesIO()
        im.save(buf, format="WEBP", quality=QUALITY, method=4)
        data = buf.getvalue()
        if len(data) + 1024 < orig:
            path.write_bytes(data)
            return orig, len(data), "ok"
        return orig, orig, "skip"
    except Exception as e:
        return orig, orig, type(e).__name__


def main():
    files = [str(p) for p in ROOT.glob("*.webp")]
    before = after = changed = errors = 0
    with ProcessPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(compress, f) for f in files]
        for i, fut in enumerate(as_completed(futs), 1):
            b, a, st = fut.result()
            before += b
            after += a
            if st == "ok":
                changed += 1
            elif st not in ("ok", "skip"):
                errors += 1
            if i % 1500 == 0 or i == len(files):
                print(
                    f"{i}/{len(files)} changed={changed} "
                    f"now_mb={round(after/1024/1024,1)} errors={errors}",
                    flush=True,
                )
    print("before_mb", round(before / 1024 / 1024, 1))
    print("after_mb", round(after / 1024 / 1024, 1))
    print("changed", changed, "errors", errors)


if __name__ == "__main__":
    main()
