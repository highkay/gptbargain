# 安全与凭据

这个项目应当可以公开发布，但不能提交明文密码、会话 Cookie、API Key 或访问凭据。

## 凭据边界

这些值不能进入 Git：

- `ADMIN_PASSWORD`：初始后台登录密码。
- `SESSION_SECRET`：Cookie 签名密钥。
- `NEXUSVAULT_SCM_SESSION`：可选的 NexusVault 兜底 `scm_session`。
- 在 `/admin` 创建的用户访问凭据。
- 任何真实商家 API Key、Bearer Token、私钥或平台登录 Cookie。

生产环境通过 Wrangler secrets 注入：

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
wrangler secret put NEXUSVAULT_SCM_SESSION
```

本地开发只把本地 secret 写入 `.dev.vars` 或 `.dev.vars.*`。这两类文件已被 Git 忽略。

## 运行时存储

运行时凭据存储在仓库之外：

- 后台密码更新后，以 PBKDF2 记录写入 KV 的 `admin:password`。
- 用户访问凭据以 SHA-256 哈希写入 KV 的 `credential:{sha256}`。
- NexusVault 平台登录态写入 KV 的 `platform-config:{siteId}`。

KV 导出、D1 导出和 `.wrangler/state/` 都属于运行状态数据，可能包含本地调试快照或平台登录态，不能提交。

## 公开标识符

`wrangler.jsonc` 包含 KV namespace ID、preview ID、D1 database ID 等 Cloudflare 绑定标识符。它们不是认证凭据，但会暴露部署元数据。如果把仓库作为模板或发布部署无关版本，应先替换这些 ID。

`src/shops.ts` 可以包含来自公开店铺链接的 shop URL token。它们是公开目录接口的路由标识，不是应用凭据。不要把私有商家 token 或账号 Cookie 写入这里。

## 发布前检查

推送前运行：

```bash
npm run check
git status --short --ignored
git grep -n -I -i -E "(api[_-]?key|secret|password|passwd|token|session|scm_session|authorization|bearer|cookie|private[_-]?key|-----BEGIN)" -- . ':!package-lock.json'
git log --all --name-only --pretty=format:%H -G "(api[_-]?key|secret|password|passwd|token|session|scm_session|authorization|bearer|cookie|private[_-]?key|-----BEGIN)" -- .
```

逐条检查命中项。预期命中通常是变量名、类型名、文档说明、Cookie 处理代码、公开 shop URL token 和 Cloudflare 绑定标识符。

如果发现明文密码、有效 `scm_session`、API token、Bearer token 或私钥，必须先从工作区和 Git 历史中移除，再推送。
