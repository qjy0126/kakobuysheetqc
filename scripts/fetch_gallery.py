#!/usr/bin/env python3
"""Download 2 extra Weidian photos per product into img/products/{id}-2.webp and {id}-3.webp."""
import json
import shutil
import signal
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path("/Users/cusky/Desktop/kakobuy")
OUT = ROOT / "img/products"
STAGE = Path("/tmp/kakobuy-gallery")
CACHE = ROOT / "scripts/gallery_urls.json"
CACHE_TMP = Path("/tmp/kakobuy-gallery-urls.json")
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://weidian.com/",
}
WORKERS = 8


def product_ids():
    ids = []
    for path in OUT.glob("*.webp"):
        stem = path.stem
        if stem.endswith("-2") or stem.endswith("-3"):
            continue
        if stem.isdigit():
            ids.append(stem)
    return sorted(ids)


def have_pair(folder, item_id):
    a = folder / f"{item_id}-2.webp"
    b = folder / f"{item_id}-3.webp"
    return a.exists() and a.stat().st_size > 800 and b.exists() and b.stat().st_size > 800


def have_extras(item_id):
    return have_pair(OUT, item_id) or have_pair(STAGE, item_id)


def publish():
    STAGE.mkdir(parents=True, exist_ok=True)
    copied = 0
    for path in STAGE.glob("*.webp"):
        dest = OUT / path.name
        if dest.exists() and dest.stat().st_size >= path.stat().st_size:
            continue
        shutil.copy2(path, dest)
        copied += 1
    if CACHE_TMP.exists():
        shutil.copy2(CACHE_TMP, CACHE)
    print("published", copied, "files", flush=True)
    return copied


def walk_urls(node, found):
    if isinstance(node, str):
        if "geilicdn" in node and (".jpg" in node or ".png" in node or ".webp" in node):
            found.append(node.split("?")[0].replace(".jpg.webp", ".jpg"))
    elif isinstance(node, dict):
        for value in node.values():
            walk_urls(value, found)
    elif isinstance(node, list):
        for value in node:
            walk_urls(value, found)


def sku_urls(item_id):
    param = quote(json.dumps({"itemId": str(item_id)}, separators=(",", ":")))
    api = f"https://thor.weidian.com/detail/getItemSkuInfo/1.0?param={param}"
    last = None
    for attempt in range(3):
        try:
            req = Request(api, headers=UA)
            with urlopen(req, timeout=18) as res:
                data = json.loads(res.read().decode("utf-8", "replace"))
            result = data.get("result") or {}
            raw = []
            walk_urls(result, raw)
            main = (result.get("itemMainPic") or "").split("?")[0]
            uniq = []
            seen = {main} if main else set()
            for url in raw:
                if url in seen:
                    continue
                seen.add(url)
                uniq.append(url)
                if len(uniq) >= 2:
                    break
            return uniq
        except Exception as exc:
            last = type(exc).__name__
            time.sleep(0.5 * (attempt + 1))
    print("api-fail", item_id, last, flush=True)
    return []


def shrink(dest, blob=None):
    data = blob if blob is not None else (dest.read_bytes() if dest.exists() else b"")
    if len(data) < 800:
        return False
    im = Image.open(BytesIO(data))
    im.load()
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    elif im.mode == "L":
        im = im.convert("RGB")
    if max(im.size) > 560:
        im.thumbnail((560, 560), Image.Resampling.LANCZOS)
    buf = BytesIO()
    im.save(buf, format="WEBP", quality=72, method=4)
    dest.write_bytes(buf.getvalue())
    return True


def download(url, dest):
    if dest.exists() and dest.stat().st_size > 800:
        return True
    for src in (url + "?w=560&h=560&cp=1", url):
        try:
            req = Request(src, headers=UA)
            with urlopen(req, timeout=18) as res:
                blob = res.read()
            if len(blob) >= 800 and shrink(dest, blob):
                return True
        except Exception:
            continue
    return False


def fetch_one(item_id, cache):
    if have_extras(item_id):
        return item_id, "have"
    urls = cache.get(item_id) or sku_urls(item_id)
    if len(urls) < 2:
        return item_id, f"only-{len(urls)}"
    cache[item_id] = urls[:2]
    ok = 0
    for i, url in enumerate(urls[:2], start=2):
        if download(url, STAGE / f"{item_id}-{i}.webp"):
            ok += 1
    return item_id, f"ok-{ok}" if ok else "dl-fail"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    STAGE.mkdir(parents=True, exist_ok=True)
    cache = {}
    if CACHE.exists():
        cache.update(json.loads(CACHE.read_text(encoding="utf-8")))
    if CACHE_TMP.exists():
        cache.update(json.loads(CACHE_TMP.read_text(encoding="utf-8")))
    ids = product_ids()
    todo = [i for i in ids if not have_extras(i)]
    print("products", len(ids), "todo", len(todo), flush=True)
    done = {"have": 0, "ok": 0, "fail": 0}

    def flush(_signum=None, _frame=None):
        CACHE_TMP.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
        publish()
        if _signum:
            raise SystemExit(0)

    signal.signal(signal.SIGTERM, flush)
    signal.signal(signal.SIGINT, flush)
    try:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            futs = {pool.submit(fetch_one, iid, cache): iid for iid in todo}
            for n, fut in enumerate(as_completed(futs), 1):
                iid, status = fut.result()
                if status == "have" or status.startswith("ok"):
                    done["ok" if status.startswith("ok") else "have"] += 1
                else:
                    done["fail"] += 1
                print(f"{n}/{len(todo)} {iid} {status}", flush=True)
                if n % 50 == 0:
                    CACHE_TMP.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
        CACHE_TMP.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
        publish()
        print("done", done, flush=True)
    except SystemExit:
        print("stopped", done, flush=True)


if __name__ == "__main__":
    main()
