# Analytics 事件

站点用 Google Analytics 4（gtag），测量 ID：`G-8199QNWH6R`（Firebase 项目 `kakobuywebsite2`）。Firebase 若绑了同一条 Analytics，看到的是同一份数据。

自动会记：打开页面（`page_view`）。下面是另外打的自定义事件。

查看： [Google Analytics](https://analytics.google.com/) → 实时。自定义事件第一次进完整报表可能要几小时。

## buy_kakobuy

点「Buy on Kakobuy」或任意跳转 `kakobuy.com` 的购买链接（不含注册页）。

| 参数 | 含义 |
| --- | --- |
| `agent` | 固定 `kakobuy` |
| `item_id` | 商品 ID |
| `item_name` | 标题 |
| `value` | 价格 |
| `currency` | `USD` |
| `items` | 见下方商品结构 |
| `link_url` | 点击的 Kakobuy 链接 |
| `page_path` | 当前页路径 |

## signup_kakobuy

点 Kakobuy 注册 / 领券链接（`/register`）。

| 参数 | 含义 |
| --- | --- |
| `link_url` | 注册链接 |
| `page_path` | 当前页路径 |

## view_item / select_item

打开某个商品详情页记 `view_item`。列表里点卡片会先记 `select_item`。

两条都会带顶层 `item_id`、`item_name`（商品标题，最长 100 字），Firebase 事件参数里可以直接看到商品名。`view_item` 另外带 `currency`、`value`、`items`。`select_item` 另外带 `item_list_name`（当前页，如 `shop` / `home` / `item`）和 `items`。

## search

顶栏搜索：回车，或点建议词。

| 参数 | 含义 |
| --- | --- |
| `search_term` | 搜索词 |

## filter

点分类，或商店页改排序。带 `qc=1` 的链接也会记一条 QC 筛选。

| 参数 | 含义 |
| --- | --- |
| `filter_type` | `category` / `sort` / `qc` |
| `filter_value` | 分类 slug、排序值（`latest` / `popular` / `rating` / `price-asc` / `price-desc`），或 QC 为 `1` |

## 商品结构 `items`

`view_item`、`select_item`、`buy_kakobuy` 共用：

| 字段 | 含义 |
| --- | --- |
| `item_id` | 商品 ID |
| `item_name` | 标题 |
| `item_category` | 分类 |
| `price` | 价格 |
| `quantity` | `1` |

实现：`js/data.js` 的 `KF.track` / `KF.gaItem`，调用在 `js/ui.js`、`js/pages.js`。
