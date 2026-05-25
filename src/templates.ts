const baseStyles = `
  :root {
    --paper: #f5ecd9;
    --paper-strong: #e7d7b9;
    --ink: #1b1a16;
    --muted: #6a6558;
    --accent: #b2482f;
    --accent-soft: rgba(178, 72, 47, 0.12);
    --line: rgba(27, 26, 22, 0.18);
    --card: rgba(255, 251, 243, 0.86);
    --success: #335f41;
    --shadow: 0 24px 70px rgba(48, 36, 16, 0.12);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 100%;
    color: var(--ink);
    background:
      radial-gradient(circle at top left, rgba(178, 72, 47, 0.18), transparent 36%),
      radial-gradient(circle at right 15% top 10%, rgba(51, 95, 65, 0.16), transparent 24%),
      linear-gradient(180deg, #efe3c9 0%, #f9f3e7 48%, #f5ecd9 100%);
    font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(27, 26, 22, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(27, 26, 22, 0.04) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.22), transparent 85%);
  }

  a {
    color: inherit;
  }

  .shell {
    width: min(1160px, calc(100% - 32px));
    margin: 0 auto;
    padding: 28px 0 48px;
  }

  .hero {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(255, 250, 242, 0.9), rgba(236, 223, 194, 0.7));
    box-shadow: var(--shadow);
  }

  .hero::after {
    content: "";
    position: absolute;
    width: 240px;
    height: 240px;
    right: -52px;
    top: -56px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(178, 72, 47, 0.24) 0%, transparent 68%);
    filter: blur(6px);
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    padding: 20px 22px;
    display: grid;
    gap: 12px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--accent);
    box-shadow: 0 0 0 6px rgba(178, 72, 47, 0.12);
  }

  h1,
  h2,
  h3 {
    margin: 0;
    font-family: "Fraunces", "Times New Roman", serif;
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .hero h1 {
    margin-top: 0;
    font-size: clamp(1.9rem, 4vw, 3.2rem);
    line-height: 0.95;
    max-width: 12ch;
  }

  .hero p {
    margin: 14px 0 0;
    max-width: 62ch;
    color: var(--muted);
    line-height: 1.65;
  }

  .hero-meta {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
  }

  .stat {
    border-radius: 14px;
    border: 1px solid var(--line);
    background: rgba(255, 251, 243, 0.78);
    padding: 10px 12px;
  }

  .stat strong {
    display: block;
    font-size: 1.25rem;
    font-family: "Fraunces", serif;
  }

  .stat span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: 0.82rem;
  }

  .panel-grid {
    margin-top: 16px;
    display: grid;
    gap: 14px;
  }

  .panel-grid.two {
    grid-template-columns: minmax(300px, 0.85fr) minmax(0, 1.55fr);
  }

  .panel {
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--card);
    box-shadow: var(--shadow);
    padding: 18px;
    backdrop-filter: blur(10px);
    min-width: 0;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .panel-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .panel-title h2 {
    font-size: 1.2rem;
  }

  .panel-title span {
    color: var(--muted);
    font-size: 0.82rem;
  }

  .form-grid {
    display: grid;
    gap: 10px;
  }

  .field-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  label {
    display: grid;
    gap: 6px;
    color: var(--muted);
    font-size: 0.92rem;
  }

  input,
  select,
  button,
  textarea {
    font: inherit;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid rgba(27, 26, 22, 0.16);
    border-radius: 12px;
    padding: 11px 13px;
    background: rgba(255, 252, 246, 0.92);
    color: var(--ink);
    outline: none;
    transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--accent);
    transform: translateY(-1px);
    background: #fffdf8;
  }

  textarea {
    min-height: 110px;
    resize: vertical;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    padding: 0;
    margin: 0;
    accent-color: var(--accent);
    border-radius: 6px;
  }

  .checkbox-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ink);
    font-size: 0.95rem;
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  button,
  .button-link {
    appearance: none;
    border: 0;
    border-radius: 999px;
    padding: 10px 14px;
    cursor: pointer;
    text-decoration: none;
    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
  }

  .button-primary {
    background: var(--ink);
    color: #fff8ee;
    box-shadow: 0 12px 28px rgba(27, 26, 22, 0.18);
  }

  .button-accent {
    background: var(--accent);
    color: #fff8ee;
    box-shadow: 0 12px 28px rgba(178, 72, 47, 0.18);
  }

  .button-ghost {
    background: rgba(255, 250, 242, 0.82);
    color: var(--ink);
    border: 1px solid var(--line);
  }

  button:hover,
  .button-link:hover {
    transform: translateY(-1px);
  }

  .hint,
  .muted {
    color: var(--muted);
  }

  .notice {
    border-radius: 18px;
    padding: 14px 16px;
    background: rgba(255, 249, 239, 0.95);
    border: 1px solid rgba(178, 72, 47, 0.18);
    color: var(--muted);
  }

  .notice.error {
    background: rgba(178, 72, 47, 0.12);
    border-color: rgba(178, 72, 47, 0.3);
    color: #6f2013;
  }

  .notice.success {
    background: rgba(51, 95, 65, 0.12);
    border-color: rgba(51, 95, 65, 0.28);
    color: var(--success);
  }

  .results-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .result-grid,
  .card-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .result-card,
  .mini-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: rgba(255, 252, 247, 0.92);
    padding: 14px;
    box-shadow: 0 16px 34px rgba(40, 31, 17, 0.08);
  }

  .result-card::before,
  .mini-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(178, 72, 47, 0.08), transparent 46%);
    pointer-events: none;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    padding: 7px 11px;
    font-size: 0.82rem;
    background: rgba(255, 247, 234, 0.9);
    border: 1px solid rgba(27, 26, 22, 0.08);
  }

  .chip[data-state="in_stock"] {
    background: rgba(51, 95, 65, 0.12);
    color: var(--success);
  }

  .chip[data-state="sold_out"] {
    background: rgba(178, 72, 47, 0.12);
    color: #7e2a1b;
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 10px 0 8px;
  }

  .price strong {
    font-size: 1.55rem;
    font-family: "Fraunces", serif;
  }

  .price span {
    color: var(--muted);
    text-decoration: line-through;
  }

  .result-card h3,
  .mini-card h3 {
    font-size: 1.15rem;
    line-height: 1.05;
  }

  .result-card p,
  .mini-card p {
    margin: 8px 0 0;
    color: var(--muted);
    line-height: 1.45;
    font-size: 0.88rem;
  }

  .meta-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .meta-item {
    padding-top: 8px;
    border-top: 1px solid rgba(27, 26, 22, 0.08);
  }

  .meta-item small {
    display: block;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .meta-item strong {
    font-size: 0.96rem;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .credential-list {
    display: grid;
    gap: 12px;
  }

  .credential-row {
    border: 1px solid rgba(27, 26, 22, 0.1);
    border-radius: 16px;
    background: rgba(255, 252, 247, 0.94);
    padding: 12px;
    display: grid;
    gap: 10px;
  }

  .table-frame {
    overflow: auto;
    border: 1px solid rgba(27, 26, 22, 0.1);
    border-radius: 12px;
    background: rgba(255, 252, 247, 0.84);
  }

  .data-table {
    width: 100%;
    min-width: 860px;
    border-collapse: collapse;
  }

  .data-table.compact {
    min-width: 720px;
  }

  .data-table.wide {
    min-width: 1080px;
  }

  .data-table th,
  .data-table td {
    padding: 9px 10px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid rgba(27, 26, 22, 0.08);
    font-size: 0.86rem;
  }

  .data-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    color: var(--muted);
    background: rgba(244, 236, 219, 0.94);
    font-family: "Azeret Mono", "Consolas", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .data-table tbody tr:hover {
    background: rgba(178, 72, 47, 0.05);
  }

  .data-table tbody tr.is-disabled {
    color: var(--muted);
    background: rgba(255, 252, 247, 0.5);
  }

  .cell-stack {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .cell-stack strong {
    font-weight: 700;
  }

  .cell-stack span,
  .muted-cell {
    color: var(--muted);
    font-size: 0.8rem;
  }

  .cell-tight {
    white-space: nowrap;
  }

  .cell-truncate {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .table-actions button,
  .table-actions .button-link {
    padding: 7px 9px;
    border-radius: 8px;
    font-size: 0.8rem;
  }

  .table-input {
    min-width: 170px;
    border-radius: 8px;
    padding: 8px 9px;
    font-size: 0.84rem;
  }

  .scroll-frame {
    overflow: auto;
    border: 1px solid rgba(27, 26, 22, 0.1);
    border-radius: 16px;
    background: rgba(255, 252, 247, 0.8);
  }

  .detail-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
  }

  .detail-table th,
  .detail-table td {
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid rgba(27, 26, 22, 0.08);
    font-size: 0.88rem;
  }

  .detail-table th {
    color: var(--muted);
    background: rgba(244, 236, 219, 0.86);
    font-family: "Azeret Mono", "Consolas", monospace;
    font-size: 0.77rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .stack {
    display: grid;
    gap: 6px;
  }

  .inline-note {
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.55;
  }

  .credential-head {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .mono {
    font-family: "Azeret Mono", "Consolas", monospace;
  }

  .data-table .mono {
    word-break: break-all;
  }

  .empty {
    padding: 22px;
    border-radius: 20px;
    border: 1px dashed rgba(27, 26, 22, 0.2);
    text-align: center;
    color: var(--muted);
    background: rgba(255, 252, 247, 0.6);
  }

  .top-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .brand {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
  }

  .brand strong {
    font-family: "Fraunces", serif;
    font-size: 1.05rem;
  }

  .brand span {
    color: var(--muted);
    font-size: 0.85rem;
  }

  .page-foot {
    margin-top: 18px;
    color: var(--muted);
    text-align: center;
    font-size: 0.9rem;
  }

  @media (max-width: 820px) {
    .panel-grid.two,
    .field-row {
      grid-template-columns: 1fr;
    }

    .hero-inner {
      padding: 24px;
    }

    .shell {
      width: min(100% - 20px, 1160px);
      padding-top: 18px;
    }
  }
`;

function renderLayout(title: string, body: string, script = ""): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;600&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>${baseStyles}</style>
  </head>
  <body>
    ${body}
    ${script ? `<script type="module">${script}</script>` : ""}
  </body>
</html>`;
}

export function renderCredentialLoginPage(): string {
  const body = `
    <main class="shell">
      <div class="top-nav">
        <div class="brand">
          <strong>gptbargain</strong>
          <span>访问</span>
        </div>
        <a class="button-link button-ghost" href="/admin">后台入口</a>
      </div>

      <section class="hero">
        <div class="hero-inner">
          <div>
            <h1>输入凭据</h1>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>访问凭据</h2>
          </div>
        </div>

        <form id="login-form" class="form-grid">
          <label>
            凭据
            <input id="credential" name="credential" type="password" placeholder="输入访问凭据" autocomplete="off" required />
          </label>
          <div class="button-row">
            <button class="button-accent" type="submit">进入</button>
          </div>
        </form>
        <div id="message" class="notice" style="display:none;"></div>
      </section>
    </main>
  `;

  const script = `
    const form = document.getElementById("login-form");
    const message = document.getElementById("message");

    function show(text, type = "error") {
      message.textContent = text;
      message.className = "notice " + (type === "success" ? "success" : "error");
      message.style.display = "block";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const credential = document.getElementById("credential").value.trim();
      if (!credential) {
        show("请输入凭据。");
        return;
      }

      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ credential })
      });

      const payload = await response.json().catch(() => ({ error: "登录失败" }));
      if (!response.ok) {
        show(payload.error || "凭据无效。");
        return;
      }

      show("验证通过。", "success");
      window.location.href = payload.redirect || "/search";
    });
  `;

  return renderLayout("gptbargain | 访问凭据", body, script);
}

export function renderSearchPage(): string {
  const body = `
    <main class="shell">
      <div class="top-nav">
        <div class="brand">
          <strong>gptbargain</strong>
          <span>搜索</span>
        </div>
        <div class="toolbar">
          <a class="button-link button-ghost" href="/admin">后台</a>
          <button id="logout-button" class="button-ghost">退出</button>
        </div>
      </div>

      <section class="hero">
        <div class="hero-inner">
          <div>
            <h1>搜索</h1>
          </div>
          <div class="hero-meta">
            <div class="stat-grid">
              <div class="stat">
                <strong id="site-count">-</strong>
                <span>站点数</span>
              </div>
              <div class="stat">
                <strong id="item-count">-</strong>
                <span>商品数</span>
              </div>
              <div class="stat">
                <strong id="visible-count">-</strong>
                <span>当前命中</span>
              </div>
              <div class="stat">
                <strong id="updated-at">-</strong>
                <span>最近刷新</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>筛选</h2>
            </div>
          </div>
          <div class="form-grid">
            <div class="field-row">
              <label>
                关键词
                <input id="filter-q" type="search" placeholder="关键词" />
              </label>
              <label>
                站点
                <select id="filter-site">
                  <option value="">全部站点</option>
                </select>
              </label>
            </div>
            <div class="field-row">
              <label>
                库存
                <select id="filter-stock">
                  <option value="">全部状态</option>
                  <option value="in_stock">只看有货</option>
                  <option value="sold_out">只看售罄</option>
                  <option value="unknown">只看未知</option>
                </select>
              </label>
              <label>
                排序
                <select id="filter-sort">
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="updated-desc">最近刷新优先</option>
                  <option value="sold-desc">销量优先</option>
                </select>
              </label>
             </div>
             <div class="button-row" id="live-source-controls" style="display:none;">
               <label class="checkbox-row">
                 <input id="client-auto-load" type="checkbox" />
                 <span>自动加载全部直连源</span>
               </label>
               <button id="client-load-trigger" class="button-ghost" type="button">加载全部直连源</button>
             </div>
             <div id="live-source-status" class="notice" style="display:none;"></div>
           </div>
         </section>

        <section class="panel">
          <div class="results-header">
            <div class="panel-title">
              <h2>搜索结果</h2>
              <span id="result-summary">加载中...</span>
            </div>
          </div>
          <div id="result-list" class="table-frame"></div>
          <div id="result-pagination" class="button-row" style="display:none;"></div>
          <div id="empty-state" class="empty" style="display:none;">无结果</div>
        </section>
      </div>
    </main>
  `;

  const script = `
    const CLIENT_AUTO_LOAD_KEY = "gptbargain.client-auto-load";
    const CLIENT_SELECTED_SITE_KEY = "gptbargain.client-selected-site";
    const CLIENT_CACHE_KEY_PREFIX = "gptbargain.client-cache.";
    const CLIENT_COOLDOWN_KEY_PREFIX = "gptbargain.client-cooldown.";
    const CLIENT_REQUEST_MIN_INTERVAL_MS = 2000;
    const CLIENT_REQUEST_MAX_INTERVAL_MS = 4500;
    const CLIENT_HOST_BURST_LIMIT = 6;
    const CLIENT_HOST_BURST_PAUSE_MIN_MS = 20000;
    const CLIENT_HOST_BURST_PAUSE_MAX_MS = 40000;
    const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000;
    const CLIENT_HOST_COOLDOWN_MS = 10 * 60 * 1000;

    function readClientAutoLoadPreference() {
      try {
        return window.localStorage.getItem(CLIENT_AUTO_LOAD_KEY) === "1";
      } catch {
        return false;
      }
    }

    function readSelectedSitePreference() {
      try {
        return window.localStorage.getItem(CLIENT_SELECTED_SITE_KEY) || "";
      } catch {
        return "";
      }
    }

    const state = {
      catalog: null,
      filtered: [],
      liveStatuses: {},
      clientAutoLoad: readClientAutoLoadPreference(),
      clientLoadStarted: false,
      clientLoadRunning: false,
      clientLoadProgress: null,
      clientHostLastAt: {},
      clientHostBurstCounts: {},
      blockedClientHosts: {},
      loadedClientSources: {},
      selectedClientSiteId: readSelectedSitePreference(),
      clientCacheHydrated: false,
      itemPage: 1,
      itemPageSize: 24
    };

    const resultList = document.getElementById("result-list");
    const resultPagination = document.getElementById("result-pagination");
    const emptyState = document.getElementById("empty-state");
    const summary = document.getElementById("result-summary");
    const liveStatusBox = document.getElementById("live-source-status");
    const liveSourceControls = document.getElementById("live-source-controls");
    const clientAutoLoadToggle = document.getElementById("client-auto-load");
    const clientLoadTrigger = document.getElementById("client-load-trigger");

    const controls = {
      q: document.getElementById("filter-q"),
      site: document.getElementById("filter-site"),
      stock: document.getElementById("filter-stock"),
      sort: document.getElementById("filter-sort")
    };

    function formatNumber(value) {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
      }
      return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
    }

    function summarizeHtml(raw) {
      if (!raw || typeof raw !== "string") {
        return null;
      }
      const plain = raw
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\\s+/g, " ")
        .trim();
      return plain ? plain.slice(0, 180) : null;
    }

    function inferStockState(stockExact, stockDisplay) {
      if (stockExact !== null && stockExact !== undefined) {
        return stockExact > 0 ? "in_stock" : "sold_out";
      }
      const normalized = (stockDisplay || "").trim();
      if (!normalized) {
        return "unknown";
      }
      if (["充足", "有货", "库存充足"].includes(normalized)) {
        return "in_stock";
      }
      if (["0", "售罄", "无货", "缺货"].includes(normalized)) {
        return "sold_out";
      }
      return "unknown";
    }

    function numberOrNull(value) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    }

    function formatTime(value) {
      if (!value) {
        return "-";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString("zh-CN", { hour12: false });
    }

    function truncateText(value, maxLength) {
      const text = (value || "").trim();
      if (!text || text.length <= maxLength) {
        return text;
      }
      return text.slice(0, Math.max(0, maxLength - 3)) + "...";
    }

    function createChip(text, stateValue = "") {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = text;
      if (stateValue) {
        span.dataset.state = stateValue;
      }
      return span;
    }

    function renderLiveStatus() {
      if (!state.catalog || !Array.isArray(state.catalog.clientSources) || state.catalog.clientSources.length === 0) {
        liveSourceControls.style.display = "none";
        liveStatusBox.style.display = "none";
        liveStatusBox.textContent = "";
        return;
      }

      liveSourceControls.style.display = "flex";
      clientAutoLoadToggle.checked = state.clientAutoLoad;
      const counts = summarizeClientSourceStates();
      clientLoadTrigger.disabled = state.clientLoadRunning;
      clientLoadTrigger.textContent = state.clientLoadRunning
        ? "直连加载中"
        : counts.live > 0
          ? "重新加载全部直连源"
          : "加载全部直连源";

      const parts = [];
      if (counts.live > 0) {
        parts.push("实时 " + counts.live);
      }
      if (counts.cached > 0) {
        parts.push("缓存 " + counts.cached);
      }
      if (counts.paused > 0) {
        parts.push("暂停 " + counts.paused);
      }
      if (counts.error > 0) {
        parts.push("失败 " + counts.error);
      }
      if (counts.loading > 0) {
        parts.push("进行中 " + counts.loading);
      }

      const progress = state.clientLoadProgress;
      if (state.clientLoadRunning && progress) {
        liveStatusBox.className = "notice";
        liveStatusBox.textContent =
          "直连加载中 " +
          progress.done +
          "/" +
          progress.total +
          " · 当前 " +
          progress.current +
          (parts.length > 0 ? " · " + parts.join(" · ") : "");
        liveStatusBox.style.display = "block";
        return;
      }

      liveStatusBox.className =
        "notice " + (counts.error > 0 ? "error" : counts.live > 0 || counts.cached > 0 ? "success" : "");
      liveStatusBox.textContent =
        parts.length > 0
          ? "直连源 " + counts.total + " 个 · " + parts.join(" · ")
          : "默认不自动加载直连源";
      liveStatusBox.style.display = "block";
    }

    function summarizeClientSourceStates() {
      if (!state.catalog || !Array.isArray(state.catalog.clientSources)) {
        return {
          total: 0,
          live: 0,
          cached: 0,
          paused: 0,
          error: 0,
          loading: 0,
          idle: 0
        };
      }

      const counts = {
        total: state.catalog.clientSources.length,
        live: 0,
        cached: 0,
        paused: 0,
        error: 0,
        loading: 0,
        idle: 0
      };
      state.catalog.clientSources.forEach((source) => {
        const status = state.liveStatuses[source.siteId];
        if (!status) {
          counts.idle += 1;
          return;
        }
        if (status.phase === "success") {
          counts.live += 1;
          return;
        }
        if (status.phase === "cached") {
          counts.cached += 1;
          return;
        }
        if (status.phase === "paused") {
          counts.paused += 1;
          return;
        }
        if (status.phase === "error") {
          counts.error += 1;
          return;
        }
        if (status.phase === "loading") {
          counts.loading += 1;
          return;
        }
        counts.idle += 1;
      });
      return counts;
    }

    function latestUpdatedAt() {
      if (!state.catalog) {
        return "";
      }
      const timestamps = state.catalog.shops
        .map((shop) => shop.updatedAt)
        .filter(Boolean)
        .map((value) => new Date(value).getTime())
        .filter((value) => Number.isFinite(value));
      if (!timestamps.length) {
        return state.catalog.generatedAt;
      }
      return new Date(Math.max(...timestamps)).toISOString();
    }

    function refreshTopStats() {
      if (!state.catalog) {
        return;
      }
      document.getElementById("site-count").textContent = String(state.catalog.shops.length);
      document.getElementById("item-count").textContent = String(state.catalog.items.length);
      document.getElementById("updated-at").textContent = formatTime(latestUpdatedAt());
    }

    function createPagerState(total, requestedPage, pageSize) {
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(totalPages, Math.max(1, requestedPage));
      const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
      const end = total === 0 ? 0 : Math.min(total, page * pageSize);
      return {
        total,
        totalPages,
        page,
        pageSize,
        start,
        end,
        offset: (page - 1) * pageSize
      };
    }

    function renderPager(container, pager, onChange) {
      container.innerHTML = "";
      if (pager.total <= 0 || pager.totalPages <= 1) {
        container.style.display = "none";
        return;
      }

      const prev = document.createElement("button");
      prev.className = "button-ghost";
      prev.type = "button";
      prev.textContent = "上一页";
      prev.disabled = pager.page <= 1;
      prev.addEventListener("click", () => onChange(pager.page - 1));

      const info = document.createElement("span");
      info.className = "muted";
      info.textContent = "第 " + pager.page + " / " + pager.totalPages + " 页 · " + pager.start + "-" + pager.end + " / " + pager.total;

      const next = document.createElement("button");
      next.className = "button-ghost";
      next.type = "button";
      next.textContent = "下一页";
      next.disabled = pager.page >= pager.totalPages;
      next.addEventListener("click", () => onChange(pager.page + 1));

      container.appendChild(prev);
      container.appendChild(info);
      container.appendChild(next);
      container.style.display = "flex";
    }

    function createSearchStackCell(primary, secondary = "") {
      const td = document.createElement("td");
      const stack = document.createElement("div");
      stack.className = "cell-stack";
      const strong = document.createElement("strong");
      strong.textContent = primary || "-";
      stack.appendChild(strong);
      if (secondary) {
        const span = document.createElement("span");
        span.textContent = secondary;
        stack.appendChild(span);
      }
      td.appendChild(stack);
      return td;
    }

    function createTextCell(text, className = "") {
      const td = document.createElement("td");
      if (className) {
        td.className = className;
      }
      td.textContent = text || "-";
      return td;
    }

    function renderResultRow(item) {
      const tr = document.createElement("tr");

      const productCell = createSearchStackCell(
        truncateText(item.title, 42),
        ""
      );
      productCell.title = [item.title, item.description].filter(Boolean).join("\\n");
      tr.appendChild(productCell);
      tr.appendChild(createSearchStackCell(item.siteName, item.category + " / " + item.family));

      const priceCell = document.createElement("td");
      priceCell.className = "cell-tight";
      const priceStack = document.createElement("div");
      priceStack.className = "cell-stack";
      const price = document.createElement("strong");
      price.textContent = item.price === null ? "-" : "¥" + formatNumber(item.price);
      priceStack.appendChild(price);
      if (item.marketPrice !== null && item.marketPrice > 0 && item.marketPrice !== item.price) {
        const market = document.createElement("span");
        market.textContent = "原价 ¥" + formatNumber(item.marketPrice);
        priceStack.appendChild(market);
      }
      priceCell.appendChild(priceStack);
      tr.appendChild(priceCell);

      const stockCell = document.createElement("td");
      const stockStack = document.createElement("div");
      stockStack.className = "cell-stack";
      stockStack.appendChild(createChip(
        item.stockState === "in_stock" ? "有货" : item.stockState === "sold_out" ? "售罄" : "未知",
        item.stockState
      ));
      const stockText = document.createElement("span");
      stockText.textContent = item.stockExact !== null ? String(item.stockExact) : (item.stockDisplay || "-");
      stockStack.appendChild(stockText);
      stockCell.appendChild(stockStack);
      tr.appendChild(stockCell);

      tr.appendChild(createSearchStackCell(
        item.soldCount !== null ? String(item.soldCount) : "-",
        "起购 " + (item.minOrderQuantity !== null ? String(item.minOrderQuantity) : "-")
      ));
      tr.appendChild(createTextCell(formatTime(item.updatedAt), "cell-tight"));

      const actions = document.createElement("td");
      const buttons = document.createElement("div");
      buttons.className = "table-actions";
      if (item.detailPath) {
        const detailLink = document.createElement("a");
        detailLink.className = "button-link button-ghost";
        detailLink.href = item.detailPath;
        detailLink.textContent = item.family === "nexusvault" ? "样本" : "详情";
        buttons.appendChild(detailLink);
      }
      const link = document.createElement("a");
      link.className = "button-link button-primary";
      link.href = item.sourceUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "打开";
      buttons.appendChild(link);
      actions.appendChild(buttons);
      tr.appendChild(actions);

      return tr;
    }

    function compareItems(left, right, sortMode) {
      if (sortMode === "price-desc") {
        return (right.price ?? -1) - (left.price ?? -1);
      }
      if (sortMode === "updated-desc") {
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      }
      if (sortMode === "sold-desc") {
        return (right.soldCount ?? -1) - (left.soldCount ?? -1);
      }
      return (left.price ?? Number.MAX_SAFE_INTEGER) - (right.price ?? Number.MAX_SAFE_INTEGER);
    }

    function updateSiteSummary(siteId, patch) {
      const index = state.catalog.shops.findIndex((shop) => shop.id === siteId);
      if (index === -1) {
        return;
      }
      state.catalog.shops[index] = {
        ...state.catalog.shops[index],
        ...patch
      };
    }

    function mergeClientItems(siteId, items) {
      state.catalog.items = state.catalog.items
        .filter((item) => item.siteId !== siteId)
        .concat(items);
      state.catalog.itemCount = state.catalog.items.length;
      state.catalog.siteCount = state.catalog.shops.length;
    }

    function readJsonStorage(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    function writeJsonStorage(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }

    function removeStorage(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }

    function clientCacheKey(siteId) {
      return CLIENT_CACHE_KEY_PREFIX + siteId;
    }

    function clientCooldownKey(host) {
      return CLIENT_COOLDOWN_KEY_PREFIX + host;
    }

    function readClientCooldown(host) {
      const record = readJsonStorage(clientCooldownKey(host));
      if (!record || typeof record.until !== "number") {
        return null;
      }
      if (record.until <= Date.now()) {
        removeStorage(clientCooldownKey(host));
        return null;
      }
      return typeof record.message === "string" && record.message ? record.message : "冷却中";
    }

    function getClientHostBlockMessage(host) {
      if (state.blockedClientHosts[host]) {
        return state.blockedClientHosts[host];
      }
      const stored = readClientCooldown(host);
      if (stored) {
        state.blockedClientHosts[host] = stored;
        return stored;
      }
      return "";
    }

    function blockClientHost(host, message) {
      const finalMessage = message || "冷却中";
      state.blockedClientHosts[host] = finalMessage;
      writeJsonStorage(clientCooldownKey(host), {
        message: finalMessage,
        until: Date.now() + CLIENT_HOST_COOLDOWN_MS
      });
    }

    function readClientSourceCache(source) {
      const record = readJsonStorage(clientCacheKey(source.siteId));
      if (!record || !Array.isArray(record.items) || typeof record.cachedAt !== "number") {
        return null;
      }
      if (record.cachedAt + CLIENT_CACHE_TTL_MS <= Date.now()) {
        removeStorage(clientCacheKey(source.siteId));
        return null;
      }
      return record;
    }

    function writeClientSourceCache(source, payload) {
      writeJsonStorage(clientCacheKey(source.siteId), {
        siteName: payload.siteName,
        sourceUrl: payload.sourceUrl,
        updatedAt: payload.updatedAt,
        items: payload.items,
        cachedAt: Date.now()
      });
    }

    function applyClientSourcePayload(source, payload, mode, message) {
      const items = Array.isArray(payload.items) ? payload.items : [];
      mergeClientItems(source.siteId, items);
      updateSiteSummary(source.siteId, {
        name: payload.siteName || source.siteName,
        sourceUrl: payload.sourceUrl || source.sourceUrl,
        updatedAt: payload.updatedAt || "",
        itemCount: items.length
      });
      state.loadedClientSources[source.siteId] = mode;
      state.liveStatuses[source.siteId] = {
        phase: mode === "cache" ? "cached" : "success",
        message: message || (mode === "cache" ? "缓存 " + items.length : "+" + items.length)
      };
    }

    function hydrateClientCaches() {
      if (!state.catalog || state.clientCacheHydrated) {
        return;
      }
      state.clientCacheHydrated = true;
      state.catalog.clientSources.forEach((source) => {
        const cached = readClientSourceCache(source);
        if (!cached) {
          return;
        }
        applyClientSourcePayload(source, cached, "cache");
      });
      refreshTopStats();
      applyFilters();
    }

    function renderResults() {
      if (!state.catalog) {
        return;
      }

      const pager = createPagerState(state.filtered.length, state.itemPage, state.itemPageSize);
      state.itemPage = pager.page;
      document.getElementById("visible-count").textContent = String(state.filtered.length);
      summary.textContent =
        state.filtered.length === 0
          ? "显示 0 / " + state.catalog.items.length
          : "第 " + pager.page + " / " + pager.totalPages + " 页 · " + pager.start + "-" + pager.end + " / " + state.filtered.length;
      resultList.innerHTML = "";
      if (state.filtered.length === 0) {
        emptyState.style.display = "block";
        resultPagination.style.display = "none";
        return;
      }

      emptyState.style.display = "none";
      const table = document.createElement("table");
      table.className = "data-table wide";
      table.innerHTML = "<thead><tr><th>商品</th><th>站点</th><th>价格</th><th>库存</th><th>销量</th><th>刷新</th><th>操作</th></tr></thead>";
      const tbody = document.createElement("tbody");
      state.filtered
        .slice(pager.offset, pager.offset + pager.pageSize)
        .forEach((item) => tbody.appendChild(renderResultRow(item)));
      table.appendChild(tbody);
      resultList.appendChild(table);
      renderPager(resultPagination, pager, (page) => {
        state.itemPage = page;
        renderResults();
      });
    }

    function applyFilters(options = {}) {
      if (!state.catalog) {
        return;
      }

      const q = controls.q.value.trim().toLowerCase();
      const site = controls.site.value;
      const stock = controls.stock.value;
      const sort = controls.sort.value;

      state.filtered = state.catalog.items
        .filter((item) => {
          if (site && item.siteId !== site) {
            return false;
          }
          if (stock && item.stockState !== stock) {
            return false;
          }
          if (!q) {
            return true;
          }
          const haystack = [item.title, item.category, item.siteName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
        .sort((left, right) => compareItems(left, right, sort));

      if (options.resetPage) {
        state.itemPage = 1;
      }
      renderResults();
    }

    function hydrateFilters() {
      const select = controls.site;
      state.catalog.shops.forEach((shop) => {
        const option = document.createElement("option");
        option.value = shop.id;
        option.textContent = shop.fetchMode === "client" ? shop.name + " · 直连" : shop.name;
        select.appendChild(option);
      });
    }

    async function fetchJson(url, options = {}) {
      const response = await fetch(url, options);
      const text = await response.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        if (isWafChallengeHtml(text)) {
          const error = new Error("触发站点验证");
          error.name = "ClientWafChallengeError";
          throw error;
        }
        throw new Error(text.slice(0, 160) || "upstream returned non-json");
      }
      if (!response.ok) {
        throw new Error(payload.error || "upstream request failed");
      }
      return payload;
    }

    function isWafChallengeHtml(text) {
      if (!text || typeof text !== "string") {
        return false;
      }
      return /AliyunCaptcha\\.js|CF_APP_WAF|验证您是真人|Please complete the operation to verify that you are a real person/i.test(text);
    }

    function isWafChallengeError(error) {
      return error instanceof Error && error.name === "ClientWafChallengeError";
    }

    function getClientSourceHost(source) {
      try {
        return new URL(source.baseUrl).hostname.toLowerCase();
      } catch {
        return source.baseUrl;
      }
    }

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function pickClientRequestInterval() {
      const span = CLIENT_REQUEST_MAX_INTERVAL_MS - CLIENT_REQUEST_MIN_INTERVAL_MS;
      if (span <= 0) {
        return CLIENT_REQUEST_MIN_INTERVAL_MS;
      }
      return CLIENT_REQUEST_MIN_INTERVAL_MS + Math.floor(Math.random() * (span + 1));
    }

    function pickClientBurstPauseInterval() {
      const span = CLIENT_HOST_BURST_PAUSE_MAX_MS - CLIENT_HOST_BURST_PAUSE_MIN_MS;
      if (span <= 0) {
        return CLIENT_HOST_BURST_PAUSE_MIN_MS;
      }
      return CLIENT_HOST_BURST_PAUSE_MIN_MS + Math.floor(Math.random() * (span + 1));
    }

    async function waitForClientRequestSlot(host) {
      const burstCount = state.clientHostBurstCounts[host] || 0;
      if (burstCount >= CLIENT_HOST_BURST_LIMIT) {
        await delay(pickClientBurstPauseInterval());
        state.clientHostBurstCounts[host] = 0;
      }
      const last = state.clientHostLastAt[host] || 0;
      const targetInterval = pickClientRequestInterval();
      const waitMs = Math.max(0, targetInterval - (Date.now() - last));
      if (waitMs > 0) {
        await delay(waitMs);
      }
      state.clientHostLastAt[host] = Date.now();
      state.clientHostBurstCounts[host] = (state.clientHostBurstCounts[host] || 0) + 1;
    }

    async function fetchClientJson(source, url, options = {}) {
      const host = getClientSourceHost(source);
      const blockedMessage = getClientHostBlockMessage(host);
      if (blockedMessage) {
        const error = new Error(blockedMessage);
        error.name = "ClientHostBlockedError";
        throw error;
      }
      await waitForClientRequestSlot(host);
      return fetchJson(url, {
        credentials: "include",
        ...options
      });
    }

    function normalizeClientShopApiItem(source, siteName, row, updatedAt) {
      const stockExact = numberOrNull(row.extend && row.extend.stock_count);
      return {
        id: source.siteId + ":" + (row.goods_type || "goods") + ":" + (row.goods_key || row.name),
        siteId: source.siteId,
        siteName,
        family: "shopapi",
        externalId: typeof row.goods_key === "string" ? row.goods_key.trim() : null,
        title: typeof row.name === "string" ? row.name.trim() : "未命名商品",
        category:
          (row.category && typeof row.category.name === "string" && row.category.name.trim()) ||
          (typeof row.goods_type === "string" ? row.goods_type.trim() : "") ||
          "未分类",
        price: numberOrNull(row.price),
        marketPrice: numberOrNull(row.market_price),
        stockExact,
        stockDisplay: stockExact === null ? null : String(stockExact),
        stockState: inferStockState(stockExact, stockExact === null ? null : String(stockExact)),
        soldCount: null,
        minOrderQuantity: numberOrNull(row.extend && row.extend.limit_count),
        imageUrl: typeof row.image === "string" && row.image.trim() ? row.image.trim() : null,
        description: summarizeHtml(row.description),
        sourceUrl: typeof row.link === "string" && row.link.trim() ? row.link.trim() : source.sourceUrl,
        detailPath: null,
        updatedAt
      };
    }

    async function collectClientShopApiGoods(source, goodsType) {
      const pageSize = 100;
      let current = 1;
      let total = 0;
      const rows = [];

      do {
        const response = await fetchClientJson(source, source.baseUrl + "/shopApi/Shop/goodsList", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            token: source.token,
            keywords: "",
            category_id: 0,
            goods_type: goodsType,
            current,
            pageSize
          })
        });
        total = response.data && response.data.total ? response.data.total : 0;
        rows.push(...((response.data && response.data.list) || []));
        current += 1;
      } while (rows.length < total && current <= 20);

      return rows;
    }

    async function loadClientSource(source) {
      const host = getClientSourceHost(source);
      const blockedMessage = getClientHostBlockMessage(host);
      if (blockedMessage) {
        state.liveStatuses[source.siteId] = {
          phase: "paused",
          message: blockedMessage
        };
        renderLiveStatus();
        return;
      }

      state.liveStatuses[source.siteId] = {
        phase: "loading",
        message: "直连中"
      };
      renderLiveStatus();

      try {
        const info = await fetchClientJson(source, source.baseUrl + "/shopApi/Shop/info", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            token: source.token,
            category_key: ""
          })
        });

        const data = info.data || {};
        const types = (data.goods_type_sort || ["card", "article", "resource", "equity"]).filter((type) => {
          const countMap = {
            card: data.card_count,
            article: data.article_count,
            resource: data.resource_count,
            equity: data.equity_count
          };
          return (countMap[type] || 0) > 0;
        });

        const groups = [];
        for (const goodsType of types) {
          groups.push(await collectClientShopApiGoods(source, goodsType));
        }
        const updatedAt = new Date().toISOString();
        const siteName = (typeof data.nickname === "string" && data.nickname.trim()) || source.siteName;
        const sourceUrl = (typeof data.link === "string" && data.link.trim()) || source.sourceUrl;
        const items = groups
          .flat()
          .map((row) => normalizeClientShopApiItem(source, siteName, row, updatedAt));

        writeClientSourceCache(source, {
          name: siteName,
          sourceUrl,
          updatedAt,
          siteName,
          items
        });
        applyClientSourcePayload(source, { siteName, sourceUrl, updatedAt, items }, "live");
        refreshTopStats();
        applyFilters();
      } catch (error) {
        if (isWafChallengeError(error)) {
          blockClientHost(host, "触发验证，冷却中");
          state.liveStatuses[source.siteId] = {
            phase: "paused",
            message: "触发验证，冷却中"
          };
        } else if (error instanceof Error && error.name === "ClientHostBlockedError") {
          state.liveStatuses[source.siteId] = {
            phase: "paused",
            message: error.message || "冷却中"
          };
        } else {
          state.liveStatuses[source.siteId] = {
            phase: "error",
            message: "失败"
          };
          console.error(error);
        }
      }

      renderLiveStatus();
    }

    async function loadClientSources() {
      if (!state.catalog || !Array.isArray(state.catalog.clientSources) || state.catalog.clientSources.length === 0) {
        return;
      }
      if (state.clientLoadRunning) {
        return;
      }
      const sources = state.catalog.clientSources.slice();
      state.clientLoadRunning = true;
      state.clientLoadStarted = true;
      state.clientLoadProgress = {
        total: sources.length,
        done: 0,
        current: ""
      };
      renderLiveStatus();
      try {
        for (const source of sources) {
          state.clientLoadProgress.current = source.siteName;
          renderLiveStatus();
          await loadClientSource(source);
          state.clientLoadProgress.done += 1;
          renderLiveStatus();
        }
      } finally {
        state.clientLoadRunning = false;
        state.clientLoadProgress = null;
        renderLiveStatus();
      }
    }

    async function loadCatalog() {
      const response = await fetch("/api/catalog", {
        credentials: "include"
      });
      if (response.status === 401) {
        window.location.href = "/";
        return;
      }
      const payload = await response.json();
      payload.clientSources = Array.isArray(payload.clientSources) ? payload.clientSources : [];
      payload.shops = Array.isArray(payload.shops) ? payload.shops : [];
      payload.items = Array.isArray(payload.items) ? payload.items : [];
      state.catalog = payload;
      hydrateFilters();
      if (state.selectedClientSiteId && payload.shops.some((shop) => shop.id === state.selectedClientSiteId)) {
        controls.site.value = state.selectedClientSiteId;
      }
      hydrateClientCaches();
      refreshTopStats();
      applyFilters();
      renderLiveStatus();
      if (state.clientAutoLoad) {
        await loadClientSources();
      }
    }

    clientAutoLoadToggle.addEventListener("change", async () => {
      state.clientAutoLoad = clientAutoLoadToggle.checked;
      try {
        window.localStorage.setItem(CLIENT_AUTO_LOAD_KEY, state.clientAutoLoad ? "1" : "0");
      } catch {}
      renderLiveStatus();
      if (state.clientAutoLoad && state.catalog) {
        await loadClientSources();
      }
    });

    clientLoadTrigger.addEventListener("click", async () => {
      await loadClientSources();
    });

    Object.values(controls).forEach((control) => {
      control.addEventListener("input", () => applyFilters({ resetPage: true }));
      control.addEventListener("change", () => applyFilters({ resetPage: true }));
    });

    controls.site.addEventListener("change", async () => {
      state.selectedClientSiteId = controls.site.value;
      try {
        window.localStorage.setItem(CLIENT_SELECTED_SITE_KEY, state.selectedClientSiteId);
      } catch {}
      renderLiveStatus();
    });

    document.getElementById("logout-button").addEventListener("click", async () => {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "/";
    });

    loadCatalog().catch(() => {
      summary.textContent = "加载失败";
    });
  `;

  return renderLayout("gptbargain | 搜索", body, script);
}

export function renderNexusVaultDetailPage(siteId: string, itemId: string): string {
  const body = `
    <main class="shell">
      <div class="top-nav">
        <div class="brand">
          <strong>gptbargain</strong>
          <span>NexusVault 样本详情</span>
        </div>
        <div class="toolbar">
          <a class="button-link button-ghost" href="/search">返回搜索</a>
          <a id="detail-source-link" class="button-link button-primary" href="#" target="_blank" rel="noreferrer">打开</a>
        </div>
      </div>

      <section class="hero">
        <div class="hero-inner">
          <div>
            <h1 id="detail-title">加载中...</h1>
            <p id="detail-description"></p>
          </div>
          <div class="hero-meta">
            <div class="stat-grid">
              <div class="stat">
                <strong id="detail-price">-</strong>
                <span>价格区间</span>
              </div>
              <div class="stat">
                <strong id="detail-stock">-</strong>
                <span>供货状态</span>
              </div>
              <div class="stat">
                <strong id="detail-updated">-</strong>
                <span>平台更新时间</span>
              </div>
              <div class="stat">
                <strong id="detail-total">-</strong>
                <span>样本条数</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="panel-grid two">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>商家摘要</h2>
            </div>
          </div>
          <div id="detail-summary" class="meta-list"></div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>分页</h2>
              <span id="detail-page-text">正在加载...</span>
            </div>
          </div>
          <div class="button-row">
            <button id="detail-prev" class="button-ghost" type="button">上一页</button>
            <button id="detail-next" class="button-ghost" type="button">下一页</button>
          </div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>近期样本</h2>
            <span id="detail-table-summary">加载中...</span>
          </div>
        </div>
        <div id="detail-error" class="notice error" style="display:none;"></div>
        <div class="scroll-frame">
          <table class="detail-table">
            <thead>
              <tr>
                <th>订单</th>
                <th>方案</th>
                <th>凭据类型</th>
                <th>检查状态</th>
                <th>存活</th>
                <th>小时成本</th>
                <th>售出时间</th>
                <th>检查信息</th>
              </tr>
            </thead>
            <tbody id="detail-table-body">
              <tr>
                <td colspan="8" class="muted">加载中...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;

  const script = `
    const detailState = {
      siteId: ${JSON.stringify(siteId)},
      itemId: ${JSON.stringify(itemId)},
      page: 1,
      limit: 20,
      payload: null
    };

    const errorBox = document.getElementById("detail-error");
    const tableBody = document.getElementById("detail-table-body");

    function showError(text) {
      errorBox.textContent = text;
      errorBox.style.display = "block";
    }

    function clearError() {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }

    function formatTime(value) {
      if (!value) {
        return "-";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString("zh-CN", { hour12: false });
    }

    function formatNumber(value) {
      if (value === null || value === undefined || Number.isNaN(value)) {
        return "-";
      }
      return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
    }

    function formatPriceRange(item) {
      if (item.price === null && item.marketPrice === null) {
        return "-";
      }
      if (item.price !== null && item.marketPrice !== null && item.marketPrice !== item.price) {
        return "¥" + formatNumber(item.price) + " - ¥" + formatNumber(item.marketPrice);
      }
      const onlyPrice = item.price ?? item.marketPrice;
      return onlyPrice === null ? "-" : "¥" + formatNumber(onlyPrice);
    }

    function formatDuration(seconds) {
      if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
        return "-";
      }
      if (seconds < 60) {
        return seconds + " 秒";
      }
      if (seconds < 3600) {
        return Math.round(seconds / 60) + " 分钟";
      }
      const hours = seconds / 3600;
      return formatNumber(hours) + " 小时";
    }

    function formatCents(cents) {
      if (cents === null || cents === undefined || Number.isNaN(cents)) {
        return "-";
      }
      return "¥" + formatNumber(cents / 100);
    }

    function createMeta(label, value) {
      const block = document.createElement("div");
      block.className = "meta-item";
      const small = document.createElement("small");
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      block.appendChild(small);
      block.appendChild(strong);
      return block;
    }

    function createStackCell(primary, secondary, useMonoSecondary = false) {
      const td = document.createElement("td");
      const stack = document.createElement("div");
      stack.className = "stack";
      const strong = document.createElement("strong");
      strong.textContent = primary;
      const note = document.createElement("span");
      note.className = "inline-note" + (useMonoSecondary ? " mono" : "");
      note.textContent = secondary;
      stack.appendChild(strong);
      stack.appendChild(note);
      td.appendChild(stack);
      return td;
    }

    function renderRow(row) {
      const tr = document.createElement("tr");

      tr.appendChild(createStackCell(row.orderRef || row.orderId || "-", row.cardRef || row.cardId || "-", true));

      const planTd = document.createElement("td");
      planTd.textContent = row.plan || "-";
      tr.appendChild(planTd);

      const credentialTd = document.createElement("td");
      credentialTd.textContent = row.credentialType || "-";
      tr.appendChild(credentialTd);

      tr.appendChild(
        createStackCell(
          row.checkStatus || (row.isInvalid ? "invalid" : "-"),
          row.checkConnected === null ? "-" : row.checkConnected ? "已连通" : "未连通"
        )
      );
      tr.appendChild(
        createStackCell(
          formatDuration(row.observedSurvivalSeconds),
          row.invalidSurvivalSeconds === null ? "-" : "失效前 " + formatDuration(row.invalidSurvivalSeconds)
        )
      );

      const costTd = document.createElement("td");
      costTd.textContent = formatCents(row.observedCostPerHourCents);
      tr.appendChild(costTd);

      tr.appendChild(
        createStackCell(
          formatTime(row.soldAt),
          row.orderCreatedAt ? "下单 " + formatTime(row.orderCreatedAt) : "-"
        )
      );

      const messageTd = document.createElement("td");
      messageTd.textContent = row.checkMessage || "-";
      tr.appendChild(messageTd);

      return tr;
    }

    function renderPayload(payload) {
      detailState.payload = payload;
      document.getElementById("detail-title").textContent = payload.item.title;
      document.getElementById("detail-description").textContent = payload.item.description || "";
      document.getElementById("detail-price").textContent = formatPriceRange(payload.item);
      document.getElementById("detail-stock").textContent = payload.item.stockDisplay || payload.item.stockState || "-";
      document.getElementById("detail-updated").textContent = formatTime(payload.updatedAt || payload.item.updatedAt);
      document.getElementById("detail-total").textContent = String(payload.pagination.total);
      document.getElementById("detail-source-link").href = payload.item.sourceUrl;
      document.getElementById("detail-page-text").textContent = "第 " + payload.pagination.page + " / " + payload.pagination.totalPages + " 页";
      document.getElementById("detail-table-summary").textContent = payload.rows.length + " / " + payload.pagination.total;

      const summary = document.getElementById("detail-summary");
      summary.innerHTML = "";
      [
        ["站点", payload.item.siteName],
        ["商家 ID", payload.merchantId],
        ["开始日期", payload.startDate || "-"],
        ["开始时间", formatTime(payload.startAt)],
        ["更新", formatTime(payload.item.updatedAt)],
        ["库存标签", payload.item.stockDisplay || payload.item.stockState || "-"]
      ].forEach(([label, value]) => summary.appendChild(createMeta(label, value)));

      tableBody.innerHTML = "";
      if (!payload.rows.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 8;
        td.className = "muted";
        td.textContent = "无样本";
        tr.appendChild(td);
        tableBody.appendChild(tr);
      } else {
        payload.rows.forEach((row) => tableBody.appendChild(renderRow(row)));
      }

      document.getElementById("detail-prev").disabled = !payload.pagination.hasPrev;
      document.getElementById("detail-next").disabled = !payload.pagination.hasNext;
    }

    async function loadDetails() {
      clearError();
      const response = await fetch("/api/item-details?siteId=" + encodeURIComponent(detailState.siteId) + "&itemId=" + encodeURIComponent(detailState.itemId) + "&page=" + detailState.page + "&limit=" + detailState.limit, {
        credentials: "include"
      });
      if (response.status === 401) {
        window.location.href = "/";
        return;
      }
      const payload = await response.json().catch(() => ({ error: "详情加载失败" }));
      if (!response.ok) {
        throw new Error(payload.error || "详情加载失败");
      }
      renderPayload(payload);
    }

    document.getElementById("detail-prev").addEventListener("click", async () => {
      if (detailState.page <= 1) {
        return;
      }
      detailState.page -= 1;
      await loadDetails();
    });

    document.getElementById("detail-next").addEventListener("click", async () => {
      detailState.page += 1;
      await loadDetails();
    });

    loadDetails().catch((error) => {
      showError(error.message || "详情加载失败。");
      tableBody.innerHTML = '<tr><td colspan="8" class="muted">加载失败。</td></tr>';
    });
  `;

  return renderLayout("gptbargain | NexusVault 样本详情", body, script);
}

export function renderAdminLoginPage(): string {
  const body = `
    <main class="shell">
      <div class="top-nav">
        <div class="brand">
          <strong>gptbargain</strong>
          <span>后台</span>
        </div>
        <a class="button-link button-ghost" href="/">前台</a>
      </div>

      <section class="hero">
        <div class="hero-inner">
          <div>
            <h1>后台登录</h1>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>登录</h2>
          </div>
        </div>
        <form id="admin-login-form" class="form-grid">
          <label>
            密码
            <input id="admin-password" type="password" autocomplete="off" required />
          </label>
          <div class="button-row">
            <button class="button-accent" type="submit">进入</button>
          </div>
        </form>
        <div id="admin-message" class="notice" style="display:none;"></div>
      </section>
    </main>
  `;

  const script = `
    const form = document.getElementById("admin-login-form");
    const message = document.getElementById("admin-message");

    function show(text) {
      message.textContent = text;
      message.className = "notice error";
      message.style.display = "block";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = document.getElementById("admin-password").value;
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ password })
      });
      const payload = await response.json().catch(() => ({ error: "后台登录失败" }));
      if (!response.ok) {
        show(payload.error || "后台登录失败");
        return;
      }
      window.location.href = "/admin";
    });
  `;

  return renderLayout("gptbargain | 后台登录", body, script);
}

export function renderAdminPage(): string {
  const body = `
    <main class="shell">
      <div class="top-nav">
        <div class="brand">
          <strong>gptbargain</strong>
          <span>后台</span>
        </div>
        <div class="toolbar">
          <a class="button-link button-ghost" href="/search">前台搜索</a>
          <button id="admin-logout" class="button-ghost">退出后台</button>
        </div>
      </div>

      <section class="hero">
        <div class="hero-inner">
          <div>
            <h1>后台</h1>
          </div>
          <div class="hero-meta">
            <div class="stat-grid">
              <div class="stat">
                <strong id="admin-site-count">-</strong>
                <span>配置站点</span>
              </div>
              <div class="stat">
                <strong id="admin-item-count">-</strong>
                <span>聚合商品</span>
              </div>
              <div class="stat">
                <strong id="admin-credential-count">-</strong>
                <span>访问凭据</span>
              </div>
              <div class="stat">
                <strong id="admin-refresh-at">-</strong>
                <span>最近刷新</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="panel-grid two">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>后台密码</h2>
            </div>
          </div>
          <form id="admin-password-form" class="form-grid">
            <label>
              当前密码
              <input id="admin-current-password" type="password" autocomplete="current-password" required />
            </label>
            <div class="field-row">
              <label>
                新密码
                <input id="admin-new-password" type="password" autocomplete="new-password" minlength="8" required />
              </label>
              <label>
                确认新密码
                <input id="admin-confirm-password" type="password" autocomplete="new-password" minlength="8" required />
              </label>
            </div>
            <div class="button-row">
              <button class="button-accent" type="submit">更新密码</button>
            </div>
          </form>
          <div id="admin-password-flash" class="notice" style="display:none;"></div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>新增访问凭据</h2>
            </div>
          </div>
          <form id="credential-form" class="form-grid">
            <label>
              凭据
              <input id="credential-value" type="text" placeholder="输入凭据" autocomplete="off" required />
            </label>
            <label>
              备注
              <input id="credential-note" type="text" placeholder="备注" />
            </label>
            <div class="button-row">
              <button class="button-accent" type="submit">创建凭据</button>
            </div>
          </form>
          <div id="admin-flash" class="notice" style="display:none;"></div>
        </section>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>刷新状态</h2>
            </div>
            <button id="refresh-now" class="button-ghost" type="button">刷新全部</button>
          </div>
          <div id="refresh-progress" class="notice" style="display:none;"></div>
          <div id="refresh-status" class="table-frame"></div>
        </section>
      </div>

      <div class="panel-grid two">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2 id="shop-form-title">新增店铺</h2>
              <span id="shop-form-hint">粘贴链接后自动填充</span>
            </div>
          </div>
          <form id="shop-form" class="form-grid">
            <div class="field-row">
              <label>
                站点 ID
                <input id="shop-id" type="text" placeholder="自动生成" autocomplete="off" />
              </label>
              <label>
                名称
                <input id="shop-name" type="text" placeholder="站点名称" autocomplete="off" required />
              </label>
            </div>
            <div class="field-row">
              <label>
                类型
                <select id="shop-family">
                  <option value="shopapi">shopapi</option>
                  <option value="acg-like">acg-like</option>
                  <option value="dujiao-next">dujiao-next</option>
                  <option value="autopixel-rsc">autopixel-rsc</option>
                  <option value="nexusvault">nexusvault</option>
                </select>
              </label>
              <label>
                店铺链接
                <input id="shop-base-url" type="url" placeholder="https://example.com/shop/xxx" autocomplete="off" required />
              </label>
            </div>
            <label>
              方式
              <select id="shop-fetch-mode">
                <option value="worker">Worker</option>
                <option value="client">直连</option>
              </select>
            </label>
            <label id="shop-token-group">
              Token
              <input id="shop-token" type="text" placeholder="Token" autocomplete="off" />
            </label>
            <label id="shop-workspace-group" style="display:none;">
              Workspace
              <input id="shop-workspace-path" type="text" placeholder="/workspace/extract" autocomplete="off" />
            </label>
            <label class="checkbox-row">
              <input id="shop-enabled" type="checkbox" checked />
              <span>启用</span>
            </label>
            <div class="button-row">
              <button id="shop-save" class="button-accent" type="submit">保存</button>
              <button id="shop-reset" class="button-ghost" type="button">重置</button>
            </div>
          </form>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>店铺列表</h2>
              <span id="shop-summary">加载中...</span>
            </div>
            <button id="shop-restore-defaults" class="button-ghost" type="button">恢复默认</button>
          </div>
          <div id="shop-list" class="table-frame"></div>
          <div id="shop-pagination" class="button-row" style="display:none;"></div>
          <div id="shop-empty" class="empty" style="display:none;">无店铺</div>
        </section>
      </div>

      <div class="panel-grid">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>平台凭据</h2>
            </div>
          </div>
          <div id="platform-config-list" class="table-frame"></div>
          <div id="platform-config-empty" class="empty" style="display:none;">无平台凭据</div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <h2>凭据列表</h2>
            </div>
          </div>
          <div id="credential-list" class="table-frame"></div>
          <div id="credential-empty" class="empty" style="display:none;">无凭据</div>
        </section>
      </div>
    </main>
  `;

  const script = `
    const flash = document.getElementById('admin-flash');
    const passwordFlash = document.getElementById('admin-password-flash');
    const refreshProgress = document.getElementById('refresh-progress');
    const refreshNowButton = document.getElementById('refresh-now');
    const credentialList = document.getElementById('credential-list');
    const credentialEmpty = document.getElementById('credential-empty');
    const refreshStatus = document.getElementById('refresh-status');
    const platformConfigList = document.getElementById('platform-config-list');
    const platformConfigEmpty = document.getElementById('platform-config-empty');
    const shopList = document.getElementById('shop-list');
    const shopPagination = document.getElementById('shop-pagination');
    const shopSummary = document.getElementById('shop-summary');
    const shopEmpty = document.getElementById('shop-empty');

    const shopForm = document.getElementById('shop-form');
    const shopIdInput = document.getElementById('shop-id');
    const shopNameInput = document.getElementById('shop-name');
    const shopFamilyInput = document.getElementById('shop-family');
    const shopBaseUrlInput = document.getElementById('shop-base-url');
    const shopFetchModeInput = document.getElementById('shop-fetch-mode');
    const shopTokenInput = document.getElementById('shop-token');
    const shopWorkspacePathInput = document.getElementById('shop-workspace-path');
    const shopEnabledInput = document.getElementById('shop-enabled');
    const shopTokenGroup = document.getElementById('shop-token-group');
    const shopWorkspaceGroup = document.getElementById('shop-workspace-group');
    const shopFormTitle = document.getElementById('shop-form-title');
    const shopFormHint = document.getElementById('shop-form-hint');
    const shopSaveButton = document.getElementById('shop-save');

    const pageState = {
      editingShopId: '',
      suspendShopAutofill: false
    };

    const dashboardState = {
      shops: [],
      shopPage: 1,
      shopPageSize: 10,
      refreshing: false
    };

    function showFlash(text, type = 'success') {
      flash.textContent = text;
      flash.className = 'notice ' + (type === 'error' ? 'error' : 'success');
      flash.style.display = 'block';
    }

    function showPasswordFlash(text, type = 'success') {
      passwordFlash.textContent = text;
      passwordFlash.className = 'notice ' + (type === 'error' ? 'error' : 'success');
      passwordFlash.style.display = 'block';
    }

    function setRefreshProgress(text, type = '') {
      if (!text) {
        refreshProgress.textContent = '';
        refreshProgress.className = 'notice';
        refreshProgress.style.display = 'none';
        return;
      }
      refreshProgress.textContent = text;
      refreshProgress.className = 'notice ' + type;
      refreshProgress.style.display = 'block';
    }

    function setRefreshRunning(running) {
      dashboardState.refreshing = running;
      refreshNowButton.disabled = running;
      refreshNowButton.textContent = running ? '刷新中' : '刷新全部';
    }

    function formatTime(value) {
      if (!value) {
        return '-';
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString('zh-CN', { hour12: false });
    }

    function createPagerState(total, requestedPage, pageSize) {
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(totalPages, Math.max(1, requestedPage));
      const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
      const end = total === 0 ? 0 : Math.min(total, page * pageSize);
      return {
        total,
        totalPages,
        page,
        pageSize,
        start,
        end,
        offset: (page - 1) * pageSize
      };
    }

    function renderPager(container, pager, onChange) {
      container.innerHTML = '';
      if (pager.total <= 0 || pager.totalPages <= 1) {
        container.style.display = 'none';
        return;
      }

      const prev = document.createElement('button');
      prev.className = 'button-ghost';
      prev.type = 'button';
      prev.textContent = '上一页';
      prev.disabled = pager.page <= 1;
      prev.addEventListener('click', () => onChange(pager.page - 1));

      const info = document.createElement('span');
      info.className = 'muted';
      info.textContent = '第 ' + pager.page + ' / ' + pager.totalPages + ' 页 · ' + pager.start + '-' + pager.end + ' / ' + pager.total;

      const next = document.createElement('button');
      next.className = 'button-ghost';
      next.type = 'button';
      next.textContent = '下一页';
      next.disabled = pager.page >= pager.totalPages;
      next.addEventListener('click', () => onChange(pager.page + 1));

      container.appendChild(prev);
      container.appendChild(info);
      container.appendChild(next);
      container.style.display = 'flex';
    }

    async function api(path, options = {}) {
      const response = await fetch(path, {
        credentials: 'include',
        ...options,
        headers: {
          'content-type': 'application/json',
          ...(options.headers || {})
        }
      });
      if (response.status === 401) {
        window.location.href = '/admin';
        throw new Error('unauthorized');
      }
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || '请求失败');
      }
      return payload;
    }

    function createMiniMeta(label, value) {
      const item = document.createElement('div');
      item.className = 'meta-item';
      const small = document.createElement('small');
      small.textContent = label;
      const strong = document.createElement('strong');
      strong.textContent = value;
      item.appendChild(small);
      item.appendChild(strong);
      return item;
    }

    function createTable(headers, className = 'data-table') {
      const table = document.createElement('table');
      table.className = className;
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      const tbody = document.createElement('tbody');
      table.appendChild(thead);
      table.appendChild(tbody);
      return { table, tbody };
    }

    function createCell(text, className = '') {
      const td = document.createElement('td');
      if (className) {
        td.className = className;
      }
      td.textContent = text || '-';
      return td;
    }

    function createChip(text, stateValue = '') {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = text;
      if (stateValue) {
        span.dataset.state = stateValue;
      }
      return span;
    }

    function createStackCell(primary, secondary = '', className = '') {
      const td = document.createElement('td');
      if (className) {
        td.className = className;
      }
      const stack = document.createElement('div');
      stack.className = 'cell-stack';
      const strong = document.createElement('strong');
      strong.textContent = primary || '-';
      stack.appendChild(strong);
      if (secondary) {
        const span = document.createElement('span');
        span.textContent = secondary;
        stack.appendChild(span);
      }
      td.appendChild(stack);
      return td;
    }

    function createActionsCell() {
      const td = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'table-actions';
      td.appendChild(actions);
      return { td, actions };
    }

    function appendAction(actions, text, className, onClick) {
      const button = document.createElement('button');
      button.className = className;
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', onClick);
      actions.appendChild(button);
      return button;
    }

    function slugify(value) {
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function shouldAutoFill(input) {
      return !input.value.trim() || input.dataset.auto === '1';
    }

    function setAutoValue(input, value) {
      input.value = value;
      input.dataset.auto = '1';
    }

    function setAutoSelect(select, value) {
      select.value = value;
      select.dataset.auto = '1';
    }

    async function fetchShopPreview(rawUrl) {
      const tokenHint = shopTokenInput.value.trim();
      const query = new URLSearchParams({
        url: rawUrl
      });
      if (tokenHint) {
        query.set('token', tokenHint);
      }
      const response = await fetch('/api/admin/shop-preview?' + query.toString(), {
        credentials: 'include'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || '不在支持范围内');
      }
      return payload;
    }

    let shopUrlAutofillTimer = null;

    async function autoFillShopFromUrl() {
      if (pageState.editingShopId || pageState.suspendShopAutofill) {
        return;
      }

      const raw = shopBaseUrlInput.value.trim();
      if (!raw) {
        return;
      }

      try {
        const preview = await fetchShopPreview(raw);
        shopBaseUrlInput.value = preview.baseUrl || raw;

        if (preview.family && preview.family !== 'unknown') {
          shopFamilyInput.value = preview.family;
        }
        syncShopFieldVisibility();

        if (!shopFetchModeInput.disabled && preview.fetchMode && shopFetchModeInput.dataset.auto !== '0') {
          setAutoSelect(shopFetchModeInput, preview.fetchMode);
        }
        if (preview.token && shouldAutoFill(shopTokenInput)) {
          setAutoValue(shopTokenInput, preview.token);
        }
        if (preview.workspacePath && shouldAutoFill(shopWorkspacePathInput)) {
          setAutoValue(shopWorkspacePathInput, preview.workspacePath);
        }
        if (preview.name && shouldAutoFill(shopNameInput)) {
          setAutoValue(shopNameInput, preview.name);
        }
        if (preview.suggestedId && shouldAutoFill(shopIdInput)) {
          setAutoValue(shopIdInput, preview.suggestedId);
        }
        showFlash('已识别。');
      } catch (error) {
        const message = error instanceof Error ? error.message : '不在支持范围内';
        showFlash(message, 'error');
        window.alert(message);
      }
    }

    function scheduleShopUrlAutofill() {
      if (pageState.editingShopId || pageState.suspendShopAutofill) {
        return;
      }
      clearTimeout(shopUrlAutofillTimer);
      shopUrlAutofillTimer = setTimeout(() => {
        autoFillShopFromUrl().catch((error) => console.error(error));
      }, 180);
    }

    function syncShopFieldVisibility() {
      const family = shopFamilyInput.value;
      shopTokenGroup.style.display = family === 'shopapi' ? 'grid' : 'none';
      shopWorkspaceGroup.style.display = family === 'nexusvault' ? 'grid' : 'none';
      if (family !== 'shopapi') {
        shopFetchModeInput.value = 'worker';
        shopFetchModeInput.disabled = true;
        shopFetchModeInput.dataset.auto = '1';
      } else {
        shopFetchModeInput.disabled = false;
      }
    }

    function resetShopForm() {
      pageState.suspendShopAutofill = true;
      clearTimeout(shopUrlAutofillTimer);
      pageState.editingShopId = '';
      shopForm.reset();
      shopFamilyInput.value = 'shopapi';
      shopFetchModeInput.value = 'worker';
      shopFetchModeInput.dataset.auto = '1';
      shopEnabledInput.checked = true;
      shopIdInput.disabled = false;
      shopIdInput.dataset.auto = '';
      shopNameInput.dataset.auto = '';
      shopTokenInput.dataset.auto = '';
      shopWorkspacePathInput.dataset.auto = '';
      shopFormTitle.textContent = '新增店铺';
      shopFormHint.textContent = '粘贴链接后自动填充';
      shopSaveButton.textContent = '保存';
      syncShopFieldVisibility();
      queueMicrotask(() => {
        pageState.suspendShopAutofill = false;
      });
    }

    function fillShopForm(item) {
      pageState.editingShopId = item.id;
      shopIdInput.value = item.id;
      shopNameInput.value = item.name;
      shopFamilyInput.value = item.family;
      shopBaseUrlInput.value = item.baseUrl;
      shopFetchModeInput.value = item.fetchMode || 'worker';
      shopTokenInput.value = item.token || '';
      shopWorkspacePathInput.value = item.workspacePath || '';
      shopEnabledInput.checked = Boolean(item.enabled);
      shopIdInput.disabled = true;
      shopIdInput.dataset.auto = '';
      shopNameInput.dataset.auto = '';
      shopTokenInput.dataset.auto = '';
      shopWorkspacePathInput.dataset.auto = '';
      shopFormTitle.textContent = '编辑店铺';
      shopFormHint.textContent = item.id;
      shopSaveButton.textContent = '更新';
      syncShopFieldVisibility();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderCredentialRow(item) {
      const tr = document.createElement('tr');
      if (!item.enabled) {
        tr.className = 'is-disabled';
      }

      const hashCell = createStackCell(item.hash.slice(0, 12), item.hash.slice(12, 32) + '...', 'mono');
      hashCell.title = item.hash;
      tr.appendChild(hashCell);

      const noteCell = document.createElement('td');
      const noteInput = document.createElement('input');
      noteInput.className = 'table-input';
      noteInput.type = 'text';
      noteInput.value = item.note || '';
      noteInput.placeholder = '备注';
      noteCell.appendChild(noteInput);
      tr.appendChild(noteCell);

      const statusCell = document.createElement('td');
      statusCell.appendChild(createChip(item.enabled ? '启用' : '禁用', item.enabled ? 'in_stock' : 'sold_out'));
      tr.appendChild(statusCell);

      tr.appendChild(createCell(formatTime(item.createdAt), 'cell-tight'));
      tr.appendChild(createCell(formatTime(item.updatedAt), 'cell-tight'));
      tr.appendChild(createCell(formatTime(item.lastUsedAt), 'cell-tight'));

      const { td, actions } = createActionsCell();
      appendAction(actions, '保存备注', 'button-ghost', async () => {
        await api('/api/admin/credentials/update', {
          method: 'POST',
          body: JSON.stringify({ hash: item.hash, note: noteInput.value.trim() })
        });
        showFlash('备注已更新。');
        await loadDashboard();
      });
      appendAction(actions, item.enabled ? '禁用' : '启用', 'button-ghost', async () => {
        await api('/api/admin/credentials/toggle', {
          method: 'POST',
          body: JSON.stringify({ hash: item.hash, enabled: !item.enabled })
        });
        showFlash('状态已更新。');
        await loadDashboard();
      });
      appendAction(actions, '删除', 'button-ghost', async () => {
        await api('/api/admin/credentials/delete', {
          method: 'POST',
          body: JSON.stringify({ hash: item.hash })
        });
        showFlash('凭据已删除。');
        await loadDashboard();
      });
      tr.appendChild(td);
      return tr;
    }

    function renderCredentialRows(credentials) {
      credentialList.innerHTML = '';
      if (!credentials.length) {
        credentialList.style.display = 'none';
        credentialEmpty.style.display = 'block';
        return;
      }
      credentialList.style.display = 'block';
      credentialEmpty.style.display = 'none';
      const { table, tbody } = createTable(['哈希', '备注', '状态', '创建', '更新', '最近使用', '操作'], 'data-table wide');
      credentials.forEach((item) => tbody.appendChild(renderCredentialRow(item)));
      credentialList.appendChild(table);
    }

    function renderRefreshRows(status) {
      refreshStatus.innerHTML = '';
      if (!status || !status.siteResults || status.siteResults.length === 0) {
        refreshStatus.style.display = 'none';
        return;
      }

      refreshStatus.style.display = 'block';
      const { table, tbody } = createTable(['站点', '方式', '状态', '商品', '更新时间', '错误'], 'data-table');
      status.siteResults.forEach((site) => {
        const tr = document.createElement('tr');
        tr.appendChild(createStackCell(site.siteName, site.family + ' / ' + site.siteId));
        tr.appendChild(createCell(site.fetchMode === 'client' ? '直连' : 'Worker', 'cell-tight'));

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'chip';
        if (site.fetchMode === 'client') {
          badge.textContent = '直连';
        } else {
          badge.dataset.state = site.ok ? 'in_stock' : 'sold_out';
          badge.textContent = site.ok ? (site.stale ? '缓存回退' : '刷新成功') : '刷新失败';
        }
        statusCell.appendChild(badge);
        tr.appendChild(statusCell);

        tr.appendChild(createCell(String(site.itemCount), 'cell-tight'));
        tr.appendChild(createCell(formatTime(site.updatedAt), 'cell-tight'));
        tr.appendChild(createCell(site.error || (site.fetchMode === 'client' ? '浏览器拉取' : '-'), 'cell-truncate'));
        tbody.appendChild(tr);
      });
      refreshStatus.appendChild(table);
    }

    function renderShop(item) {
      const tr = document.createElement('tr');
      if (!item.enabled) {
        tr.className = 'is-disabled';
      }

      tr.appendChild(createStackCell(item.name, item.family + ' / ' + item.id));
      tr.appendChild(createCell(item.baseUrl, 'cell-truncate'));
      tr.appendChild(createCell(item.fetchMode === 'client' ? '直连' : 'Worker', 'cell-tight'));
      tr.appendChild(createCell(item.source === 'd1' ? 'D1' : '默认', 'cell-tight'));

      const statusCell = document.createElement('td');
      statusCell.appendChild(createChip(item.enabled ? '启用' : '停用', item.enabled ? 'in_stock' : 'sold_out'));
      tr.appendChild(statusCell);

      const extra = item.family === 'shopapi'
        ? 'token ' + (item.token || '-')
        : item.family === 'nexusvault'
          ? 'workspace ' + (item.workspacePath || '-')
          : '-';
      tr.appendChild(createCell(extra, 'cell-truncate'));
      tr.appendChild(createCell(formatTime(item.updatedAt), 'cell-tight'));

      const { td, actions } = createActionsCell();
      appendAction(actions, '编辑', 'button-accent', () => fillShopForm(item));
      appendAction(actions, item.enabled ? '停用' : '启用', 'button-ghost', async () => {
        const payload = await api('/api/admin/shops/toggle', {
          method: 'POST',
          body: JSON.stringify({ siteId: item.id, enabled: !item.enabled })
        });
        showFlash('已更新。');
        renderShopRows(payload.shops || []);
      });
      appendAction(actions, '删除', 'button-ghost', async () => {
        const payload = await api('/api/admin/shops/delete', {
          method: 'POST',
          body: JSON.stringify({ siteId: item.id })
        });
        showFlash('已删除。');
        if (pageState.editingShopId === item.id) {
          resetShopForm();
        }
        renderShopRows(payload.shops || []);
      });
      tr.appendChild(td);
      return tr;
    }

    function renderShopRows(shops, options = {}) {
      dashboardState.shops = Array.isArray(shops) ? shops : [];
      if (options.resetPage) {
        dashboardState.shopPage = 1;
      }

      shopList.innerHTML = '';
      document.getElementById('admin-site-count').textContent = String(dashboardState.shops.length);
      shopSummary.textContent = dashboardState.shops.length ? String(dashboardState.shops.length) + ' 个店铺' : '0 个店铺';

      if (!dashboardState.shops.length) {
        shopList.style.display = 'none';
        shopEmpty.style.display = 'block';
        shopPagination.style.display = 'none';
        return;
      }

      shopList.style.display = 'block';
      shopEmpty.style.display = 'none';
      const pager = createPagerState(dashboardState.shops.length, dashboardState.shopPage, dashboardState.shopPageSize);
      dashboardState.shopPage = pager.page;
      shopSummary.textContent = '第 ' + pager.page + ' / ' + pager.totalPages + ' 页 · ' + pager.start + '-' + pager.end + ' / ' + pager.total;
      const { table, tbody } = createTable(['站点', '基础 URL', '方式', '来源', '状态', '参数', '更新', '操作'], 'data-table wide');
      dashboardState.shops
        .slice(pager.offset, pager.offset + pager.pageSize)
        .forEach((item) => tbody.appendChild(renderShop(item)));
      shopList.appendChild(table);
      renderPager(shopPagination, pager, (page) => {
        dashboardState.shopPage = page;
        renderShopRows(dashboardState.shops);
      });
    }

    function renderPlatformConfig(item) {
      const tr = document.createElement('tr');

      tr.appendChild(createStackCell(item.siteName, item.family + ' / ' + item.siteId));

      const statusCell = document.createElement('td');
      statusCell.appendChild(createChip(
        item.configured ? (item.source === 'kv' ? 'KV 已配置' : '环境变量兜底') : '未配置',
        item.configured ? 'in_stock' : 'unknown'
      ));
      tr.appendChild(statusCell);

      tr.appendChild(createCell(item.preview || '-', 'mono cell-tight'));
      tr.appendChild(createCell(formatTime(item.updatedAt), 'cell-tight'));

      const inputCell = document.createElement('td');
      const input = document.createElement('input');
      input.className = 'table-input';
      input.type = 'password';
      input.placeholder = 'scm_session';
      input.autocomplete = 'off';
      inputCell.appendChild(input);
      tr.appendChild(inputCell);

      const { td, actions } = createActionsCell();
      appendAction(actions, '保存', 'button-accent', async () => {
        const scmSession = input.value.trim();
        if (!scmSession) {
          showFlash('请先输入 scm_session。', 'error');
          return;
        }
        const payload = await api('/api/admin/platform-configs', {
          method: 'POST',
          body: JSON.stringify({ siteId: item.siteId, scmSession })
        });
        showFlash('已保存。');
        renderPlatformRows(payload.configs || []);
        input.value = '';
      });
      appendAction(actions, '清空', 'button-ghost', async () => {
        const payload = await api('/api/admin/platform-configs/clear', {
          method: 'POST',
          body: JSON.stringify({ siteId: item.siteId })
        });
        showFlash('已清空。');
        renderPlatformRows(payload.configs || []);
      });
      tr.appendChild(td);
      return tr;
    }

    function renderPlatformRows(configs) {
      platformConfigList.innerHTML = '';
      if (!configs.length) {
        platformConfigList.style.display = 'none';
        platformConfigEmpty.style.display = 'block';
        return;
      }
      platformConfigList.style.display = 'block';
      platformConfigEmpty.style.display = 'none';
      const { table, tbody } = createTable(['站点', '状态', '预览', '更新', '新凭据', '操作'], 'data-table');
      configs.forEach((item) => tbody.appendChild(renderPlatformConfig(item)));
      platformConfigList.appendChild(table);
    }

    async function loadDashboard() {
      const [statusPayload, credentialsPayload, platformPayload, shopsPayload] = await Promise.all([
        api('/api/admin/status'),
        api('/api/admin/credentials'),
        api('/api/admin/platform-configs'),
        api('/api/admin/shops')
      ]);

      document.getElementById('admin-item-count').textContent = String(statusPayload.catalog.itemCount);
      document.getElementById('admin-refresh-at').textContent = formatTime(statusPayload.catalog.generatedAt);
      document.getElementById('admin-credential-count').textContent = String(credentialsPayload.credentials.length);

      renderCredentialRows(credentialsPayload.credentials || []);
      renderRefreshRows(statusPayload.refresh);
      renderPlatformRows(platformPayload.configs || []);
      renderShopRows(shopsPayload.shops || []);
    }

    [shopIdInput, shopNameInput, shopTokenInput, shopWorkspacePathInput].forEach((input) => {
      input.addEventListener('input', () => {
        input.dataset.auto = '';
      });
    });

    shopFetchModeInput.addEventListener('change', () => {
      shopFetchModeInput.dataset.auto = '0';
    });

    shopBaseUrlInput.addEventListener('input', scheduleShopUrlAutofill);
    shopBaseUrlInput.addEventListener('change', scheduleShopUrlAutofill);
    shopBaseUrlInput.addEventListener('blur', scheduleShopUrlAutofill);
    shopBaseUrlInput.addEventListener('paste', () => {
      setTimeout(scheduleShopUrlAutofill, 0);
    });

    shopFamilyInput.addEventListener('change', () => {
      syncShopFieldVisibility();
      scheduleShopUrlAutofill();
    });

    shopForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      pageState.suspendShopAutofill = true;
      clearTimeout(shopUrlAutofillTimer);
      try {
        const payload = {
          id: shopIdInput.value.trim(),
          name: shopNameInput.value.trim(),
          family: shopFamilyInput.value,
          baseUrl: shopBaseUrlInput.value.trim(),
          fetchMode: shopFetchModeInput.value,
          token: shopTokenInput.value.trim(),
          workspacePath: shopWorkspacePathInput.value.trim(),
          enabled: shopEnabledInput.checked
        };
        const result = await api('/api/admin/shops', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showFlash(result.created ? '已新增。' : '已更新。');
        renderShopRows(result.shops || [], { resetPage: !pageState.editingShopId });
        resetShopForm();
      } finally {
        if (pageState.editingShopId) {
          pageState.suspendShopAutofill = false;
        }
      }
    });

    document.getElementById('shop-reset').addEventListener('click', () => {
      resetShopForm();
    });

    document.getElementById('shop-restore-defaults').addEventListener('click', async () => {
      const payload = await api('/api/admin/shops/reset', {
        method: 'POST',
        body: JSON.stringify({ reset: true })
      });
      showFlash('已恢复默认。');
      renderShopRows(payload.shops || [], { resetPage: true });
      resetShopForm();
      await loadDashboard();
    });

    const adminPasswordForm = document.getElementById('admin-password-form');
    const adminPasswordSubmit = adminPasswordForm.querySelector('button[type="submit"]');

    adminPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const currentPassword = document.getElementById('admin-current-password').value;
      const newPassword = document.getElementById('admin-new-password').value;
      const confirmPassword = document.getElementById('admin-confirm-password').value;
      if (newPassword.length < 8) {
        showPasswordFlash('新密码至少 8 位。', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showPasswordFlash('两次输入的新密码不一致。', 'error');
        return;
      }
      adminPasswordSubmit.disabled = true;
      adminPasswordSubmit.textContent = '更新中';
      try {
        await api('/api/admin/password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword })
        });
        adminPasswordForm.reset();
        showPasswordFlash('后台密码已更新。');
      } catch (error) {
        const message = error instanceof Error ? error.message : '后台密码更新失败。';
        showPasswordFlash(message, 'error');
      } finally {
        adminPasswordSubmit.disabled = false;
        adminPasswordSubmit.textContent = '更新密码';
      }
    });

    document.getElementById('credential-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const credential = document.getElementById('credential-value').value.trim();
      const note = document.getElementById('credential-note').value.trim();
      if (!credential) {
        showFlash('访问凭据不能为空。', 'error');
        return;
      }

      const payload = await api('/api/admin/credentials', {
        method: 'POST',
        body: JSON.stringify({ credential, note, enabled: true })
      });
      showFlash(payload.created ? '已创建。' : '已更新。');
      document.getElementById('credential-form').reset();
      await loadDashboard();
    });

    document.getElementById('refresh-now').addEventListener('click', async () => {
      setRefreshRunning(true);
      setRefreshProgress('准备刷新...');
      try {
        let cursor = 0;
        let rounds = 0;
        let totalItems = 0;
        let refreshedWorkers = 0;
        let totalWorkers = 0;

        while (rounds < 32) {
          const payload = await api('/api/admin/refresh', {
            method: 'POST',
            body: JSON.stringify({ cursor })
          });
          totalItems = payload.catalog.itemCount;
          totalWorkers = payload.totalWorkerShops || 0;
          refreshedWorkers += payload.refreshedWorkerShops || 0;
          cursor = typeof payload.nextCursor === 'number' ? payload.nextCursor : 0;
          rounds += 1;

          setRefreshProgress(
            '第 ' + rounds + ' 批 · ' + Math.min(refreshedWorkers, totalWorkers || refreshedWorkers) + '/' + (totalWorkers || refreshedWorkers) + ' 站点 · ' + totalItems + ' 商品',
            totalWorkers > 0 && !payload.completedCycle ? '' : 'success'
          );

          if (totalWorkers > 0 && !payload.completedCycle) {
            continue;
          }
          break;
        }

        showFlash('已刷新：' + totalItems);
        setRefreshProgress('刷新完成。', 'success');
        await loadDashboard();
      } catch (error) {
        const message = error instanceof Error ? error.message : '刷新失败';
        showFlash(message, 'error');
        setRefreshProgress(message, 'error');
      } finally {
        setRefreshRunning(false);
      }
    });

    document.getElementById('admin-logout').addEventListener('click', async () => {
      await fetch('/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/admin';
    });

    resetShopForm();
    loadDashboard().catch((error) => {
      showFlash(error.message || '后台加载失败。', 'error');
    });
  `;

  return renderLayout("gptbargain | 后台", body, script);
}

export function renderNotFoundPage(): string {
  return renderLayout(
    "404 | gptbargain",
    `
      <main class="shell">
        <section class="hero">
          <div class="hero-inner">
            <div>
              <div class="eyebrow"><span class="dot"></span>Not Found</div>
              <h1>这个入口不存在。</h1>
              <div class="button-row" style="margin-top:18px;">
                <a class="button-link button-accent" href="/">前台</a>
                <a class="button-link button-ghost" href="/admin">后台</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    `
  );
}
