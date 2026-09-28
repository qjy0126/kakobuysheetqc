# Kakobuy Spreadsheet · kakobuysheetqc.com

独立目录站，域名 [kakobuysheetqc.com](https://kakobuysheetqc.com)。

版式参考了常见 spreadsheet / WooCommerce 目录站（分类、品牌墙、QC、优惠码、链接转换），配色与文案为原创，不是原站拷贝。

产品图与 `catalog.js` 暂与同目录下的 `kakobuyqcsheets` 共享（符号链接），上线前如需独立仓库可再复制并跑 `scripts/build_seo_pages.py`。

## 本地预览

```bash
cd "/Users/cusky/Desktop/kakobuy网站/kakobuysheetqc.com"
python3 -m http.server 5174
```

打开 http://localhost:5174

## 上线 kakobuysheetqc.com

可选：推到 GitHub 后打开 **Settings → Pages**，Source 选 `main` / `/ (root)`。`CNAME` 已写成 `kakobuysheetqc.com`。也可用 Cloudflare Workers（见 `wrangler.toml`）。

域名 DNS：

- 根域名 `kakobuysheetqc.com` 用 A 记录指向 GitHub Pages：
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www.kakobuysheetqc.com` 用 CNAME 指向你的 `*.github.io`

生效后访问 https://kakobuysheetqc.com
