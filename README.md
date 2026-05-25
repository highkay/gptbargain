# gptbargain

一个最小可部署的 Cloudflare Worker 聚合器：

- 后台首次用 `ADMIN_PASSWORD` 登录，之后可在后台修改密码
- 访问凭据存到 `KV`
- 高频聚合数据存到 `D1`
- 只有输入正确访问凭据的用户才能进入搜索页
- 店铺抓取走 Worker 定时刷新
- 前端搜索在浏览器本地完成，不在用户搜索时 fan-out 抓外站

## 目录

- [src/index.ts](./src/index.ts)：Worker 路由、认证、抓取、D1/KV 读写
- [src/shops.ts](./src/shops.ts)：代码内置默认店铺配置
- [src/templates.ts](./src/templates.ts)：登录页、后台页、搜索页
- [src/types.ts](./src/types.ts)：共享类型
- [migrations/0001_init.sql](./migrations/0001_init.sql)：D1 表结构
- [docs/security.md](./docs/security.md)：凭据边界和发布前泄露检查

## 准备

1. 安装依赖

```bash
npm install
```

2. 创建 KV Namespace

```bash
wrangler kv namespace create APP_KV
wrangler kv namespace create APP_KV --preview
```

把返回的 `id` / `preview_id` 填进 [wrangler.jsonc](./wrangler.jsonc)。

3. 创建 D1 数据库并执行迁移

```bash
wrangler d1 create gptbargain-db
wrangler d1 migrations apply gptbargain-db --remote
```

把返回的 `database_id` 填进 [wrangler.jsonc](./wrangler.jsonc)。

4. 注入后台密码和签名密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

- `ADMIN_PASSWORD`：后台首次登录密码；后台保存新密码后会优先使用 KV 中的密码记录
- `SESSION_SECRET`：Cookie 签名密钥，建议 32 字节以上随机字符串

不要把实际密码或签名密钥写入代码、README、`wrangler.jsonc` 或 Git 历史。更多边界见 [docs/security.md](./docs/security.md)。

5. 可选注入 NexusVault 兜底登录态

```bash
wrangler secret put NEXUSVAULT_SCM_SESSION
```

- `NEXUSVAULT_SCM_SESSION`：`trade.livetools.top` 的 `scm_session` 值
- 现在更推荐在 `/admin` 后台直接把 `scm_session` 写入 `KV`
- 环境变量只作为兜底；如果后台已经保存了同站点的平台凭据，会优先使用 `KV`

## 本地开发

```bash
npm run dev
```

如果要本地调试 secret，也可以使用 Wrangler 支持的本地 secret 配置。
本地 secret 文件应放在 `.dev.vars` 或 `.dev.vars.*`，这两类文件已经被 `.gitignore` 排除。

## 部署

```bash
npm run deploy
```

## 使用流程

1. 打开 `/admin`
2. 用 `ADMIN_PASSWORD` 登录后台，必要时先在“后台密码”里更新后台登录密码
3. 如有需要，先在“店铺配置”里新增或修改站点；代码里的默认店铺会在第一次后台改动后固化进 `D1`
4. 如果启用了 `NexusVault`，再到“平台访问凭据”里保存 `scm_session`
5. 新增一个访问凭据字符串，例如 `alpha-2026-guest`
6. 点击“立即刷新全部店铺”
7. 普通用户打开 `/`
8. 输入访问凭据后进入 `/search`
9. 对 `NexusVault` 商家候选，可以继续打开“查看样本”进入详情页

## 当前简化设计

- 运行时优先从 `D1` 读取店铺配置；如果还没有后台保存过，则回退到 [src/shops.ts](./src/shops.ts) 的默认列表
- 后台管理“后台密码”、“店铺配置”、“访问凭据”、“平台登录态”和“刷新抓取”
- 默认每 10 分钟跑一轮定时刷新
- 为了避免免费版 Worker 的单次 subrequest 上限，worker 站点刷新按批轮转；后台“刷新全部”会自动拆成多次批量请求跑完整轮
- 默认情况下，用户搜索只读取当前聚合快照
- 如果某个 `shopapi` 站点配置为 `fetchMode=client`，搜索页会在浏览器里直接实时拉取该站点并合并结果

## 增加站点

优先在 `/admin` 的“店铺配置”里新增。

只有当你想修改“首次部署时的默认内置站点”时，才需要改 [src/shops.ts](./src/shops.ts)。

当前已适配：

- `shopapi` 家族：`/shopApi/Shop/*`
- `acg-like` 家族：`/user/api/index/*`
- `dujiao-next` 家族：`/api/v1/public/*`
- `autopixel-rsc`：`/shop` 的 Next RSC action
- `nexusvault`：`/api/workspace/seller-candidates`

拉取方式：

- `worker`：由 Cloudflare Worker 定时刷新并写入聚合快照
- `client`：仅支持 `shopapi` 家族，搜索页在浏览器端实时直连并合并，不参与 Worker 刷新

`NexusVault` 额外支持：

- 商家样本详情：`/api/merchant-rankings/{merchant_id}/details`
- 前台详情页：`/detail?siteId=...&itemId=...`

## 存储设计

- `credential:{sha256}`：访问凭据
- `admin:password`：后台密码哈希记录
- `platform-config:{siteId}`：平台登录态，例如 `scm_session`

`D1` 表：

- `shop_configs`：后台保存后的店铺配置
- `shop_snapshots`：单店快照
- `app_state`：当前全站聚合结果、刷新状态、定时刷新游标

## 注意

- `ADMIN_PASSWORD` 只作为首次/兜底后台密码；后台修改后会把 PBKDF2 哈希记录写入 `KV`
- 用户访问凭据只存哈希，不回显原文
- 店铺配置一旦在后台保存过，运行时会优先读 `D1`，不再直接使用代码里的默认数组
- `ldxp-chongapi` 默认走 `client` 模式，用浏览器直连 `pay.ldxp.cn`，避免 Cloudflare Worker 出口被该站点拦截
- 平台访问凭据当前按站点写入 `KV`；对于 `NexusVault`，默认键内容是 `scm_session`
- `.wrangler/` 是本地 Worker 状态目录，可能包含本地 KV/D1 调试数据，已被 `.gitignore` 排除，不应提交
- `store.dimosky.com` 这类站点会隐藏部分精确库存，聚合结果里会保留“有货/售罄/未知”的边界，不伪造数字
- `NexusVault` 当前接入的是“商家候选榜单”，不是传统店铺 SKU 列表；聚合页会把每个商家候选归一成一条可搜索记录，详情页展示的是近期样本和检查结果
