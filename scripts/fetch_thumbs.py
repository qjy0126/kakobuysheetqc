#!/usr/bin/env python3
"""Import ~2000 Weidian products: 温总 first, 莉总 last."""
import json
import re
import time
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

import openpyxl
from PIL import Image

ROOT = Path("/Users/cusky/Desktop/kakobuy")
XLSX = ROOT / "2026-09-10.xlsx"
OUT = ROOT / "img/products"
JS = ROOT / "js/catalog.js"
CACHE = ROOT / "scripts/pic_urls.json"
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://weidian.com/",
}

WEN_SHOPS = {"1379310004", "1700929523", "1827203015"}
LI_SHOPS = {"1846484411"}
WORKERS = 4

CAT_MAP = {
    "Shoes": "shoes",
    "Jordan 4": "shoes",
    "Air force": "shoes",
    "Nike Shox": "shoes",
    "Dior b30": "shoes",
    "Dior B30": "shoes",
    "Tops": "t-shirts",
    "Polo": "t-shirts",
    "Shirts": "t-shirts",
    "Hoodies": "hoodies",
    "Nike Tech": "hoodies",
    "Jacket": "jackets",
    "Bottoms": "pants",
    "Pants": "pants",
    "Shorts": "pants",
    "Underwear": "underwear",
    "Bag": "accessories",
    "Accessories": "accessories",
    "Watch": "watches",
    "Electronics": "other",
    "Airpods": "other",
    "Cap": "headwear",
    "Hat": "headwear",
    "Jersey": "jersey",
    "Set": "sets",
    "Tracksuit": "sets",
    "Suit": "sets",
    "Sunglasses": "glasses",
    "Dress": "other",
    "Backpack": "accessories",
    "Belt": "accessories",
    "Socks": "accessories",
    "Jeans": "pants",
    "Sweater": "hoodies",
    "Down Jacket": "jackets",
    "Vest": "jackets",
}


def guess_cat(raw, title):
    t = (title or "").lower()
    bag = any(k in t for k in ("bag", "wallet", "shoulder", "backpack", "包"))
    if re.search(r"\b(lego|bricks?)\b", t) or "积木" in t or "building block" in t:
        return "bricks"
    if (re.search(r"\b(sunglasses?|eyewear|ray-?ban|oakley)\b", t) or "眼镜" in t) and "jacket" not in t:
        return "glasses"
    if (re.search(r"\b(watch(?:es)?|rolex|patek|omega|casio|swatch)\b", t) or "手表" in t) and not bag:
        return "watches"
    if (re.search(r"\b(perfume|cologne|parfum)\b", t) or "香水" in t) and not bag:
        return "perfume"
    if any(k in t for k in ("shoe", "slipper", "slide", "sneaker", "jordan", "拖鞋", "鞋")):
        return "shoes"
    if any(k in t for k in ("jersey", "football kit", "soccer", "球衣")):
        return "jersey"
    if any(k in t for k in ("hoodie", "sweater", "fleece", "卫衣", "帽衫")):
        return "hoodies"
    if "帽衫" not in t and any(k in t for k in ("cap", "hat", "beanie", "trucker", "帽")):
        return "headwear"
    if any(k in t for k in ("tracksuit", "套装")) or re.search(r"\bset\b", t):
        return "sets"
    if any(k in t for k in ("jacket", "coat", "windbreaker", "bomber", "夹克", "外套")):
        return "jackets"
    if raw in CAT_MAP:
        return CAT_MAP[raw]
    if any(k in t for k in ("short", "pant", "jean", "裤")):
        return "pants"
    if any(k in t for k in ("tee", "t-shirt", "t恤", "shirt", "polo")):
        return "t-shirts"
    if any(k in t for k in ("bag", "wallet", "包", "belt", "sock", "bracelet")):
        return "accessories"
    return "other"


def seller_group(shop_id):
    sid = str(shop_id or "")
    if sid in WEN_SHOPS:
        return "wen"
    if sid in LI_SHOPS:
        return "li"
    return "other"


def load_rows():
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    h = {name: i for i, name in enumerate(rows[0])}
    items = []
    for r in rows[1:]:
        if not r or not r[h["商品id"]]:
            continue
        title = r[h["展示商品标题"]] or r[h["商品标题"]] or "Find"
        items.append(
            {
                "itemId": str(r[h["商品id"]]),
                "url": r[h["商品url"]],
                "title": str(title).strip(),
                "brand": r[h["品牌"]] or "",
                "category": guess_cat(r[h["品牌分类"]], title),
                "price_cny": float(r[h["商品优惠价"]] or 0),
                "opens": float(r[h["打开商品详情页数"]] or 0),
                "ctr": float(r[h["CTR"]] or 0),
                "shop": r[h["卖家店铺名称"]] or "",
                "shopId": str(r[h["卖家微店店铺ID"]] or ""),
                "seller": seller_group(r[h["卖家微店店铺ID"]]),
            }
        )
    return items


def pick_items(items):
    seen = set()
    picked = []
    for group in ("wen", "other", "li"):
        arr = sorted(
            [it for it in items if it["seller"] == group],
            key=lambda x: -x["opens"],
        )
        for it in arr:
            if it["itemId"] in seen:
                continue
            seen.add(it["itemId"])
            picked.append(it)
    return picked


def load_cache():
    if CACHE.exists():
        return json.loads(CACHE.read_text(encoding="utf-8"))
    return {}


def save_cache(cache):
    CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")


def local_path(item_id):
    dest = OUT / f"{item_id}.webp"
    if dest.exists() and dest.stat().st_size > 800:
        return dest
    return None


def save_webp(blob, dest, max_side=560, quality=72):
    im = Image.open(BytesIO(blob))
    im.load()
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    elif im.mode == "L":
        im = im.convert("RGB")
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    buf = BytesIO()
    im.save(buf, format="WEBP", quality=quality, method=4)
    dest.write_bytes(buf.getvalue())
    return dest


def fetch_pic(item_id, cache):
    dest = local_path(item_id)
    if dest:
        return item_id, "have", f"img/products/{item_id}.webp"
    cached = cache.get(item_id)
    last = "fail"
    pic = cached
    if not pic:
        param = quote(json.dumps({"itemId": str(item_id)}, separators=(",", ":")))
        api = f"https://thor.weidian.com/detail/getItemSkuInfo/1.0?param={param}"
        for attempt in range(3):
            try:
                req = Request(api, headers=UA)
                with urlopen(req, timeout=18) as r:
                    data = json.loads(r.read().decode("utf-8", "replace"))
                pic = ((data.get("result") or {}).get("itemMainPic") or "").split("?")[0]
                if pic:
                    break
                last = "no-img"
                break
            except Exception as e:
                last = type(e).__name__
                time.sleep(0.6 * (attempt + 1))
    if not pic:
        return item_id, last, ""
    pic = pic.replace(".jpg.webp", ".jpg")
    try:
        req = Request(pic + "?w=560&h=560&cp=1", headers=UA)
        with urlopen(req, timeout=18) as r:
            blob = r.read()
        if len(blob) >= 800:
            save_webp(blob, OUT / f"{item_id}.webp")
            return item_id, "ok", f"img/products/{item_id}.webp"
    except Exception as e:
        last = type(e).__name__
    return item_id, "remote", pic + "?w=560&h=560&cp=1"


def usd(cny):
    return round(cny / 7.2, 2) if cny else 0


def stars(ctr, opens):
    s = 4.1 + min(0.8, (ctr or 0) * 0.9) + (0.1 if opens > 200 else 0)
    return round(min(5.0, s), 1)


def write_catalog(products):
    JS.write_text(
        "KF.products = "
        + json.dumps(products, ensure_ascii=False, indent=2)
        + """;

(function () {
  const cover = {};
  const prefer = { other: "img/products/7770013729.webp" };
  KF.products.forEach(function (p) {
    if (!cover[p.category]) cover[p.category] = p.image;
  });
  KF.categories.forEach(function (c) {
    if (prefer[c.slug]) c.image = prefer[c.slug];
    else if (cover[c.slug]) c.image = cover[c.slug];
  });
  KF.allProductImage = "img/products/7784475023.webp";
  if (KF.applyExtraCategories) KF.applyExtraCategories();
})();
""",
        encoding="utf-8",
    )


def build_products(picked, images):
    products = []
    for it in picked:
        src = images.get(it["itemId"])
        if not src:
            continue
        products.append(
            {
                "id": f"p-{it['itemId']}",
                "title": it["title"][:80],
                "price": usd(it["price_cny"]),
                "rating": stars(it["ctr"], it["opens"]),
                "category": it["category"],
                "collection": it["brand"] or "Find",
                "qc": True,
                "featured": it["opens"] > 200,
                "seller": it["seller"],
                "source": "Weidian",
                "sourceUrl": it["url"] or f"https://weidian.com/item.html?itemID={it['itemId']}",
                "image": src,
                "gallery": [src],
                "sizes": ["40", "41", "42", "43", "44"]
                if it["category"] == "shoes"
                else ["S", "M", "L", "XL"],
                "summary": f"{it['brand']} · {it['shop']}".strip(" ·"),
            }
        )
    return products


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    items = load_rows()
    picked = pick_items(items)
    print(
        "picked",
        len(picked),
        dict(Counter(it["seller"] for it in picked)),
        flush=True,
    )
    cache = load_cache()
    images = {}
    todo = []
    for it in picked:
        dest = local_path(it["itemId"])
        if dest:
            images[it["itemId"]] = f"img/products/{it['itemId']}.webp"
        else:
            todo.append(it["itemId"])
    print("have", len(images), "todo", len(todo), flush=True)

    def snapshot():
        products = build_products(picked, images)
        write_catalog(products)
        return products

    ok = fail = remote = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(fetch_pic, iid, cache): iid for iid in todo}
        for i, fut in enumerate(as_completed(futs), 1):
            iid, st, src = fut.result()
            print(f"{i}/{len(todo)} {iid} {st}", flush=True)
            if src:
                images[iid] = src
                if src.startswith("http"):
                    cache[iid] = src.split("?")[0]
                    remote += 1
                else:
                    cache[iid] = cache.get(iid, "")
                    ok += 1
            else:
                fail += 1
            if i % 100 == 0:
                save_cache({k: v for k, v in cache.items() if v})
                n = len(snapshot())
                print("snapshot", n, flush=True)
    save_cache({k: v for k, v in cache.items() if v})
    products = snapshot()
    print("batch ok", ok, "remote", remote, "fail", fail, flush=True)
    print(
        "total",
        len(products),
        dict(Counter(p["seller"] for p in products)),
        dict(Counter(p["category"] for p in products)),
        flush=True,
    )


if __name__ == "__main__":
    main()
