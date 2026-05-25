import {
  SHOPS,
  type AcgLikeConfig,
  type AutopixelRscConfig,
  type DujiaoNextConfig,
  type NexusVaultConfig,
  type ShopApiConfig,
  type ShopConfig
} from "./shops";
import {
  renderAdminLoginPage,
  renderAdminPage,
  renderCredentialLoginPage,
  renderNexusVaultDetailPage,
  renderNotFoundPage,
  renderSearchPage
} from "./templates";
import type {
  CatalogItem,
  CatalogPayload,
  ClientSourceSummary,
  CredentialRecord,
  FetchMode,
  NexusVaultDetailPayload,
  NexusVaultSellerDetailRow,
  PaginationInfo,
  PlatformConfigSummary,
  RefreshSiteResult,
  RefreshStatus,
  ShopSummary,
  ShopSnapshot,
  SiteFamily
} from "./types";

interface Env {
  APP_KV: KVNamespace;
  APP_DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  NEXUSVAULT_SCM_SESSION?: string;
}

interface AccessSessionPayload {
  type: "access";
  hash: string;
  exp: number;
}

interface AdminSessionPayload {
  type: "admin";
  exp: number;
}

type SessionPayload = AccessSessionPayload | AdminSessionPayload;

const ACCESS_COOKIE = "gptbargain_access";
const ADMIN_COOKIE = "gptbargain_admin";
const ACCESS_TTL_SECONDS = 7 * 24 * 60 * 60;
const ADMIN_TTL_SECONDS = 12 * 60 * 60;
const CATALOG_KEY = "catalog:current";
const REFRESH_STATUS_KEY = "meta:refresh-status";
const REFRESH_CURSOR_KEY = "meta:refresh-cursor";
const SHOP_CONFIGS_KEY = "meta:shop-configs";
const ADMIN_PASSWORD_KEY = "admin:password";
const PLATFORM_CONFIG_PREFIX = "platform-config:";
const REFRESH_SUBREQUEST_BUDGET = 24;
const ADMIN_PASSWORD_ITERATIONS = 100_000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0";
const DEFAULT_SHOP_CONFIG_MAP = new Map(SHOPS.map((shop) => [shop.id, shop] as const));
const AUTOPIXEL_SHOP_PATH = "/shop";
const AUTOPIXEL_ROUTER_STATE_TREE =
  "%5B%22%22%2C%7B%22children%22%3A%5B%22shop%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C16%5D";

interface NexusVaultPlatformConfigRecord {
  scmSession: string;
  updatedAt: string;
}

type ManagedShopConfig = ShopConfig & {
  fetchMode: FetchMode;
  enabled: boolean;
  source: "default" | "d1";
  createdAt: string | null;
  updatedAt: string | null;
};

type StoredShopConfig = ShopConfig & {
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

interface StoredShopConfigDocument {
  shops: StoredShopConfig[];
  updatedAt: string;
}

interface ShopConfigRow {
  id: string;
  name: string;
  family: string;
  base_url: string;
  fetch_mode: string;
  token: string | null;
  workspace_path: string | null;
  enabled: number;
  created_at: string | null;
  updated_at: string | null;
}

interface SnapshotRow {
  payload: string;
}

interface AppStateRow {
  payload: string;
}

interface AdminPasswordRecord {
  version: 1;
  algorithm: "pbkdf2-sha256";
  iterations: number;
  salt: string;
  hash: string;
  updatedAt: string;
}

interface ShopConfigInput {
  id?: unknown;
  name?: unknown;
  family?: unknown;
  baseUrl?: unknown;
  fetchMode?: unknown;
  token?: unknown;
  workspacePath?: unknown;
  enabled?: unknown;
}

interface RefreshOptions {
  cursor?: number;
  persistCursor?: boolean;
}

interface RefreshBatchResult {
  catalog: CatalogPayload;
  refresh: RefreshStatus;
  nextCursor: number;
  refreshedWorkerShops: number;
  totalWorkerShops: number;
  completedCycle: boolean;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      return handleError(request, error);
    }
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(refreshAll(env));
  }
} satisfies ExportedHandler<Env>;

async function handleRequest(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/favicon.ico") {
    return svgFavicon();
  }

  if (pathname === "/") {
    const session = await requireAccessSession(request, env, false);
    if (session) {
      return redirect("/search");
    }
    return html(renderCredentialLoginPage());
  }

  if (pathname === "/auth/login" && request.method === "POST") {
    return handleAccessLogin(request, env);
  }

  if (pathname === "/auth/logout" && request.method === "POST") {
    return json({ ok: true }, 200, {
      "Set-Cookie": clearCookie(ACCESS_COOKIE)
    });
  }

  if (pathname === "/search") {
    const session = await requireAccessSession(request, env, true);
    if (!session) {
      return redirect("/");
    }
    return html(renderSearchPage());
  }

  if (pathname === "/api/catalog") {
    const session = await requireAccessSession(request, env, true);
    if (!session) {
      throw new HttpError(401, "unauthorized");
    }
    const catalog = await ensureCatalog(env);
    return json(catalog, 200, {
      "Cache-Control": "private, max-age=30"
    });
  }

  if (pathname === "/detail") {
    const session = await requireAccessSession(request, env, true);
    if (!session) {
      return redirect("/");
    }
    const siteId = url.searchParams.get("siteId") ?? "";
    const itemId = url.searchParams.get("itemId") ?? "";
    if (!siteId || !itemId) {
      throw new HttpError(400, "siteId and itemId are required");
    }
    return html(renderNexusVaultDetailPage(siteId, itemId));
  }

  if (pathname === "/api/item-details") {
    const session = await requireAccessSession(request, env, true);
    if (!session) {
      throw new HttpError(401, "unauthorized");
    }
    const siteId = url.searchParams.get("siteId") ?? "";
    const itemId = url.searchParams.get("itemId") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));
    if (!siteId || !itemId) {
      throw new HttpError(400, "siteId and itemId are required");
    }
    const payload = await buildItemDetailPayload(env, siteId, itemId, page, limit);
    return json(payload, 200, {
      "Cache-Control": "private, max-age=15"
    });
  }

  if (pathname === "/admin") {
    const session = await requireAdminSession(request, env);
    if (!session) {
      return html(renderAdminLoginPage());
    }
    return html(renderAdminPage());
  }

  if (pathname === "/admin/login" && request.method === "POST") {
    return handleAdminLogin(request, env);
  }

  if (pathname === "/admin/logout" && request.method === "POST") {
    return json({ ok: true }, 200, {
      "Set-Cookie": clearCookie(ADMIN_COOKIE)
    });
  }

  if (pathname === "/api/admin/password" && request.method === "POST") {
    return handleAdminPasswordChange(request, env);
  }

  if (pathname === "/api/admin/credentials") {
    await assertAdmin(request, env);
    if (request.method === "GET") {
      const credentials = await listCredentials(env);
      return json({ credentials });
    }
    if (request.method === "POST") {
      const payload = await readJsonBody<{
        credential?: string;
        note?: string;
        enabled?: boolean;
      }>(request);
      const credential = payload.credential?.trim() ?? "";
      if (!credential) {
        throw new HttpError(400, "credential is required");
      }
      const result = await upsertCredential(env, credential, payload.note ?? "", payload.enabled ?? true);
      return json(result);
    }
  }

  if (pathname === "/api/admin/credentials/toggle" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ hash?: string; enabled?: boolean }>(request);
    if (!payload.hash || typeof payload.enabled !== "boolean") {
      throw new HttpError(400, "hash and enabled are required");
    }
    const updated = await toggleCredential(env, payload.hash, payload.enabled);
    if (!updated) {
      throw new HttpError(404, "credential not found");
    }
    return json({ ok: true });
  }

  if (pathname === "/api/admin/credentials/update" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ hash?: string; note?: string; enabled?: boolean }>(request);
    if (!payload.hash) {
      throw new HttpError(400, "hash is required");
    }
    const updated = await updateCredential(env, payload.hash, {
      note: payload.note,
      enabled: payload.enabled
    });
    if (!updated) {
      throw new HttpError(404, "credential not found");
    }
    return json({ ok: true });
  }

  if (pathname === "/api/admin/credentials/delete" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ hash?: string }>(request);
    if (!payload.hash) {
      throw new HttpError(400, "hash is required");
    }
    await env.APP_KV.delete(credentialKey(payload.hash));
    return json({ ok: true });
  }

  if (pathname === "/api/admin/status" && request.method === "GET") {
    await assertAdmin(request, env);
    const shops = await getRuntimeShops(env);
    const [catalog, refresh] = await Promise.all([
      getStoredCatalog(env),
      getStoredRefreshStatus(env)
    ]);
    return json({
      catalog: catalog ?? {
        version: "",
        generatedAt: "",
        siteCount: shops.length,
        itemCount: 0,
        shops: [],
        clientSources: [],
        items: []
      },
      refresh: refresh ?? {
        startedAt: "",
        finishedAt: "",
        durationMs: 0,
        okCount: 0,
        failCount: 0,
        itemCount: 0,
        siteResults: []
      },
      shops: shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        family: shop.family,
        fetchMode: shop.fetchMode,
        baseUrl: shop.baseUrl,
        enabled: shop.enabled,
        source: shop.source,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt
      }))
    });
  }

  if (pathname === "/api/admin/shop-preview" && request.method === "GET") {
    await assertAdmin(request, env);
    const rawUrl = url.searchParams.get("url")?.trim() ?? "";
    const tokenHint = url.searchParams.get("token")?.trim() ?? "";
    if (!rawUrl) {
      throw new HttpError(400, "url is required");
    }
    const preview = await previewShopConfig(rawUrl, tokenHint);
    return json(preview);
  }

  if (pathname === "/api/admin/shops") {
    await assertAdmin(request, env);
    if (request.method === "GET") {
      const shops = await listShopConfigs(env);
      return json({ shops });
    }
    if (request.method === "POST") {
      const payload = await readJsonBody<ShopConfigInput>(request);
      const result = await upsertShopConfig(env, payload);
      return json(result);
    }
  }

  if (pathname === "/api/admin/shops/toggle" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ siteId?: string; enabled?: boolean }>(request);
    const siteId = payload.siteId?.trim() ?? "";
    if (!siteId || typeof payload.enabled !== "boolean") {
      throw new HttpError(400, "siteId and enabled are required");
    }
    const shops = await toggleShopConfig(env, siteId, payload.enabled);
    return json({ ok: true, shops });
  }

  if (pathname === "/api/admin/shops/delete" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ siteId?: string }>(request);
    const siteId = payload.siteId?.trim() ?? "";
    if (!siteId) {
      throw new HttpError(400, "siteId is required");
    }
    const shops = await deleteShopConfig(env, siteId);
    return json({ ok: true, shops });
  }

  if (pathname === "/api/admin/shops/reset" && request.method === "POST") {
    await assertAdmin(request, env);
    await resetShopConfigs(env);
    const shops = await listShopConfigs(env);
    return json({ ok: true, shops });
  }

  if (pathname === "/api/admin/platform-configs") {
    await assertAdmin(request, env);
    if (request.method === "GET") {
      const configs = await listPlatformConfigs(env);
      return json({ configs });
    }
    if (request.method === "POST") {
      const payload = await readJsonBody<{ siteId?: string; scmSession?: string }>(request);
      const siteId = payload.siteId?.trim() ?? "";
      const scmSession = payload.scmSession?.trim() ?? "";
      if (!siteId || !scmSession) {
        throw new HttpError(400, "siteId and scmSession are required");
      }
      await saveNexusVaultConfig(env, siteId, scmSession);
      const configs = await listPlatformConfigs(env);
      return json({ ok: true, configs });
    }
  }

  if (pathname === "/api/admin/platform-configs/clear" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ siteId?: string }>(request);
    const siteId = payload.siteId?.trim() ?? "";
    if (!siteId) {
      throw new HttpError(400, "siteId is required");
    }
    await clearPlatformConfig(env, siteId);
    const configs = await listPlatformConfigs(env);
    return json({ ok: true, configs });
  }

  if (pathname === "/api/admin/refresh" && request.method === "POST") {
    await assertAdmin(request, env);
    const payload = await readJsonBody<{ cursor?: number }>(request);
    const result = await refreshAll(env, {
      cursor: typeof payload.cursor === "number" ? payload.cursor : 0,
      persistCursor: false
    });
    return json(result);
  }

  if (pathname === "/api/health") {
    const shops = await getRuntimeShops(env);
    return json({
      ok: true,
      shops: shops.length,
      enabledShops: shops.filter((shop) => shop.enabled).length
    });
  }

  return new Response(renderNotFoundPage(), {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

async function handleAccessLogin(request: Request, env: Env): Promise<Response> {
  const payload = await readJsonBody<{ credential?: string }>(request);
  const credential = payload.credential?.trim() ?? "";
  if (!credential) {
    throw new HttpError(400, "credential is required");
  }

  const hash = await sha256Hex(credential);
  const record = await getCredential(env, hash);
  if (!record || !record.enabled) {
    throw new HttpError(401, "访问凭据无效");
  }

  await putCredential(env, hash, {
    ...record,
    lastUsedAt: nowIso(),
    updatedAt: record.updatedAt
  });

  const cookie = await createSignedCookie(env, {
    type: "access",
    hash,
    exp: unixNow() + ACCESS_TTL_SECONDS
  });

  return json(
    {
      ok: true,
      redirect: "/search"
    },
    200,
    {
      "Set-Cookie": makeCookie(ACCESS_COOKIE, cookie, ACCESS_TTL_SECONDS)
    }
  );
}

async function handleAdminLogin(request: Request, env: Env): Promise<Response> {
  if (!env.SESSION_SECRET) {
    throw new HttpError(500, "SESSION_SECRET is not configured");
  }

  const payload = await readJsonBody<{ password?: string }>(request);
  const valid = await verifyAdminPassword(env, payload.password ?? "");
  if (!valid) {
    throw new HttpError(401, "后台密码错误");
  }

  const cookie = await createSignedCookie(env, {
    type: "admin",
    exp: unixNow() + ADMIN_TTL_SECONDS
  });

  return json(
    {
      ok: true
    },
    200,
    {
      "Set-Cookie": makeCookie(ADMIN_COOKIE, cookie, ADMIN_TTL_SECONDS)
    }
  );
}

async function handleAdminPasswordChange(request: Request, env: Env): Promise<Response> {
  await assertAdmin(request, env);
  const payload = await readJsonBody<{ currentPassword?: unknown; newPassword?: unknown }>(request);
  const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";

  if (!currentPassword || !newPassword) {
    throw new HttpError(400, "currentPassword and newPassword are required");
  }
  if (newPassword.length < 8) {
    throw new HttpError(400, "newPassword must be at least 8 characters");
  }
  if (!(await verifyAdminPassword(env, currentPassword))) {
    throw new HttpError(401, "当前后台密码错误");
  }

  const record = await createAdminPasswordRecord(newPassword);
  await env.APP_KV.put(ADMIN_PASSWORD_KEY, JSON.stringify(record));
  return json({
    ok: true,
    updatedAt: record.updatedAt
  });
}

async function ensureCatalog(env: Env): Promise<CatalogPayload> {
  const existing = await getStoredCatalog(env);
  if (
    existing &&
    Array.isArray(existing.clientSources) &&
    Array.isArray(existing.shops) &&
    existing.shops.every((shop) => typeof shop.fetchMode === "string")
  ) {
    return existing;
  }
  const refreshed = await refreshAll(env);
  return refreshed.catalog;
}

async function refreshAll(env: Env, options: RefreshOptions = {}): Promise<RefreshBatchResult> {
  const startedAt = nowIso();
  const startMs = Date.now();
  const enabledShops = (await getRuntimeShops(env)).filter((shop) => shop.enabled);
  const workerShops = enabledShops.filter((shop) => shop.fetchMode === "worker");
  const clientShops = enabledShops.filter((shop) => shop.fetchMode === "client");

  const startCursor = options.cursor ?? (await getStoredRefreshCursor(env));
  const batch = pickRefreshBatch(workerShops, startCursor, REFRESH_SUBREQUEST_BUDGET);
  const previousRefresh = await getStoredRefreshStatus(env);
  const previousStatusMap = new Map((previousRefresh?.siteResults ?? []).map((item) => [item.siteId, item] as const));
  const previousSnapshots = await loadStoredSnapshots(env, workerShops.map((shop) => shop.id));

  const results = await mapLimit(batch.shops, 4, async (shop) => refreshSingleShop(env, shop));
  const snapshotMap = new Map(previousSnapshots.map((snapshot) => [snapshot.siteId, snapshot] as const));
  for (const result of results) {
    if (result.snapshot) {
      snapshotMap.set(result.snapshot.siteId, result.snapshot);
    }
  }

  const workerStatuses: RefreshSiteResult[] = workerShops.map((shop) => {
    const current = results.find((result) => result.status.siteId === shop.id)?.status;
    if (current) {
      return current;
    }

    const previous = previousStatusMap.get(shop.id);
    if (previous) {
      return previous;
    }

    const snapshot = snapshotMap.get(shop.id);
    return {
      siteId: shop.id,
      siteName: snapshot?.siteName ?? shop.name,
      family: shop.family,
      fetchMode: shop.fetchMode,
      ok: Boolean(snapshot),
      stale: Boolean(snapshot),
      itemCount: snapshot?.itemCount ?? 0,
      updatedAt: snapshot?.updatedAt ?? null,
      error: snapshot ? "未在本轮刷新" : "尚无快照"
    };
  });

  const siteResults: RefreshSiteResult[] = [
    ...workerStatuses,
    ...clientShops.map((shop) => ({
      siteId: shop.id,
      siteName: shop.name,
      family: shop.family,
      fetchMode: shop.fetchMode,
      ok: true,
      stale: false,
      itemCount: 0,
      updatedAt: null,
      error: null
    }))
  ];

  const snapshots = Array.from(snapshotMap.values());
  const items = snapshots
    .flatMap((snapshot) => snapshot.items)
    .sort((left, right) => left.siteName.localeCompare(right.siteName, "zh-CN"));

  const shops: ShopSummary[] = enabledShops.map((shop) => {
    const snapshot = snapshotMap.get(shop.id);
    return {
      id: shop.id,
      name: snapshot?.siteName ?? shop.name,
      family: shop.family,
      fetchMode: shop.fetchMode,
      sourceUrl:
        snapshot?.sourceUrl ??
        (shop.family === "shopapi"
          ? `${shop.baseUrl}/shop/${shop.token}`
          : shop.family === "nexusvault"
            ? absoluteUrl(shop.baseUrl, shop.workspacePath)
            : shop.baseUrl),
      updatedAt: snapshot?.updatedAt ?? "",
      itemCount: snapshot?.itemCount ?? 0
    };
  });
  const clientSources = buildClientSources(clientShops);

  const catalog: CatalogPayload = {
    version: nowIso(),
    generatedAt: nowIso(),
    siteCount: enabledShops.length,
    itemCount: items.length,
    shops,
    clientSources,
    items
  };

  const refresh: RefreshStatus = {
    startedAt,
    finishedAt: nowIso(),
    durationMs: Date.now() - startMs,
    okCount: siteResults.filter((item) => item.ok).length,
    failCount: siteResults.filter((item) => !item.ok).length,
    itemCount: items.length,
    siteResults
  };

  await Promise.all([
    putStoredCatalog(env, catalog),
    putStoredRefreshStatus(env, refresh),
    options.persistCursor === false ? Promise.resolve() : putStoredRefreshCursor(env, batch.nextCursor)
  ]);

  return {
    catalog,
    refresh,
    nextCursor: batch.nextCursor,
    refreshedWorkerShops: batch.shops.length,
    totalWorkerShops: workerShops.length,
    completedCycle: batch.completedCycle
  };
}

async function refreshSingleShop(
  env: Env,
  shop: ShopConfig
): Promise<{ snapshot: ShopSnapshot | null; status: RefreshSiteResult }> {
  try {
    const snapshot =
      shop.family === "shopapi"
        ? await fetchShopApiShop(shop)
        : shop.family === "acg-like"
          ? await fetchAcgLikeShop(shop)
          : shop.family === "nexusvault"
            ? await fetchNexusVaultShop(env, shop)
            : shop.family === "dujiao-next"
              ? await fetchDujiaoNextShop(shop)
              : await fetchAutopixelRscShop(shop);
    await putStoredSnapshot(env, snapshot);
    return {
      snapshot,
      status: {
        siteId: shop.id,
        siteName: snapshot.siteName,
        family: shop.family,
        fetchMode: "worker",
        ok: true,
        stale: false,
        itemCount: snapshot.itemCount,
        updatedAt: snapshot.updatedAt,
        error: null
      }
    };
  } catch (error) {
    const cached = await getStoredSnapshot(env, shop.id);
    const message = normalizeError(error);
    if (cached) {
      return {
        snapshot: cached,
        status: {
          siteId: shop.id,
          siteName: cached.siteName,
          family: shop.family,
          fetchMode: "worker",
          ok: true,
          stale: true,
          itemCount: cached.itemCount,
          updatedAt: cached.updatedAt,
          error: message
        }
      };
    }
    return {
      snapshot: null,
        status: {
          siteId: shop.id,
          siteName: shop.name,
          family: shop.family,
          fetchMode: "worker",
          ok: false,
          stale: false,
          itemCount: 0,
          updatedAt: null,
        error: message
      }
    };
  }
}

function pickRefreshBatch(
  workerShops: ShopConfig[],
  startCursor: number,
  budget: number
): { shops: ShopConfig[]; nextCursor: number; completedCycle: boolean } {
  if (workerShops.length === 0) {
    return {
      shops: [],
      nextCursor: 0,
      completedCycle: true
    };
  }

  const normalizedCursor = normalizeRefreshCursorValue(startCursor, workerShops.length);
  const shops: ShopConfig[] = [];
  let estimatedCost = 0;

  for (let offset = 0; offset < workerShops.length; offset += 1) {
    const shop = workerShops[(normalizedCursor + offset) % workerShops.length];
    const cost = estimateRefreshSubrequests(shop);
    if (shops.length > 0 && estimatedCost + cost > budget) {
      break;
    }
    shops.push(shop);
    estimatedCost += cost;
  }

  const nextCursor = normalizeRefreshCursorValue(normalizedCursor + shops.length, workerShops.length);
  return {
    shops,
    nextCursor,
    completedCycle: nextCursor === 0
  };
}

function estimateRefreshSubrequests(shop: ShopConfig): number {
  switch (shop.family) {
    case "shopapi":
      return 6;
    case "acg-like":
      return 10;
    case "nexusvault":
      return 2;
    case "dujiao-next":
      return 4;
    case "autopixel-rsc":
      return 8;
    default:
      return 6;
  }
}

function normalizeRefreshCursorValue(value: number, size: number): number {
  if (size <= 0) {
    return 0;
  }
  if (!Number.isFinite(value)) {
    return 0;
  }
  const normalized = Math.floor(value) % size;
  return normalized < 0 ? normalized + size : normalized;
}

function buildClientSources(shops: ManagedShopConfig[]): ClientSourceSummary[] {
  return shops
    .filter((shop): shop is ManagedShopConfig & ShopApiConfig => shop.family === "shopapi")
    .map((shop) => ({
      siteId: shop.id,
      siteName: shop.name,
      family: "shopapi",
      fetchMode: "client",
      baseUrl: shop.baseUrl,
      sourceUrl: `${shop.baseUrl}/shop/${shop.token}`,
      token: shop.token,
      note: "浏览器端实时直连该站点接口，不走 Worker 出口。"
    }));
}

async function listShopConfigs(env: Env): Promise<ManagedShopConfig[]> {
  return sortShops(await getRuntimeShops(env));
}

async function getRuntimeShops(env: Env): Promise<ManagedShopConfig[]> {
  const stored = await listStoredShopsFromD1(env);
  if (stored.length > 0) {
    return sortShops(stored);
  }

  const legacy = await env.APP_KV.get<StoredShopConfigDocument>(SHOP_CONFIGS_KEY, "json");
  if (legacy && Array.isArray(legacy.shops)) {
    const migrated = sortShops(
      legacy.shops.map((shop) =>
        toManagedShopConfig(shop, "d1", safeString(shop.createdAt) || null, safeString(shop.updatedAt) || null, shop.enabled ?? true)
      )
    );
    await writeShopConfigsToD1(env, migrated);
    return migrated;
  }

  return sortShops(SHOPS.map((shop) => toManagedShopConfig(shop, "default", null, null, true)));
}

async function upsertShopConfig(
  env: Env,
  payload: ShopConfigInput
): Promise<{ ok: true; created: boolean; shops: ManagedShopConfig[] }> {
  const current = await getRuntimeShops(env);
  const siteId = resolveShopId(payload);
  const existing = current.find((shop) => shop.id === siteId) ?? null;
  const normalized = toManagedShopConfig(
    {
      ...payload,
      id: siteId
    },
    "d1",
    existing?.createdAt ?? nowIso(),
    nowIso(),
    typeof payload.enabled === "boolean" ? payload.enabled : existing?.enabled ?? true
  );

  const next = sortShops(
    existing ? current.map((shop) => (shop.id === siteId ? normalized : shop)) : [...current, normalized]
  );

  await Promise.all([
    saveRuntimeShops(env, next),
    existing?.family === "nexusvault" && normalized.family !== "nexusvault"
      ? env.APP_KV.delete(platformConfigKey(siteId))
      : Promise.resolve()
  ]);

  return {
    ok: true,
    created: !existing,
    shops: next
  };
}

async function toggleShopConfig(env: Env, siteId: string, enabled: boolean): Promise<ManagedShopConfig[]> {
  const current = await getRuntimeShops(env);
  const existing = current.find((shop) => shop.id === siteId);
  if (!existing) {
    throw new HttpError(404, "shop not found");
  }
  const next = sortShops(
    current.map((shop) =>
      shop.id === siteId
        ? {
            ...shop,
            enabled,
            source: "d1" as const,
            updatedAt: nowIso()
          }
        : shop
    )
  );
  await saveRuntimeShops(env, next);
  return next;
}

async function deleteShopConfig(env: Env, siteId: string): Promise<ManagedShopConfig[]> {
  const current = await getRuntimeShops(env);
  if (!current.some((shop) => shop.id === siteId)) {
    throw new HttpError(404, "shop not found");
  }
  const next = sortShops(current.filter((shop) => shop.id !== siteId));
  await Promise.all([
    saveRuntimeShops(env, next),
    deleteStoredSnapshot(env, siteId),
    env.APP_KV.delete(snapshotKey(siteId)),
    env.APP_KV.delete(platformConfigKey(siteId))
  ]);
  return next;
}

async function resetShopConfigs(env: Env): Promise<void> {
  await Promise.all([clearStoredShopConfigs(env), clearStoredSnapshots(env), env.APP_KV.delete(SHOP_CONFIGS_KEY), invalidateCatalog(env)]);
}

async function saveRuntimeShops(env: Env, shops: ManagedShopConfig[]): Promise<void> {
  await Promise.all([writeShopConfigsToD1(env, shops), env.APP_KV.delete(SHOP_CONFIGS_KEY), invalidateCatalog(env)]);
}

async function invalidateCatalog(env: Env): Promise<void> {
  await Promise.all([deleteStoredState(env, CATALOG_KEY), deleteStoredState(env, REFRESH_STATUS_KEY), env.APP_KV.delete(CATALOG_KEY), env.APP_KV.delete(REFRESH_STATUS_KEY)]);
}

async function listStoredShopsFromD1(env: Env): Promise<ManagedShopConfig[]> {
  const result = await env.APP_DB
    .prepare(
      `SELECT id, name, family, base_url, fetch_mode, token, workspace_path, enabled, created_at, updated_at
       FROM shop_configs
       ORDER BY id`
    )
    .all<ShopConfigRow>();

  return (result.results ?? []).map((row) =>
    toManagedShopConfig(
      {
        id: row.id,
        name: row.name,
        family: row.family,
        baseUrl: row.base_url,
        fetchMode: row.fetch_mode,
        token: row.token,
        workspacePath: row.workspace_path,
        enabled: Boolean(row.enabled)
      },
      "d1",
      safeString(row.created_at) || null,
      safeString(row.updated_at) || null,
      Boolean(row.enabled)
    )
  );
}

async function writeShopConfigsToD1(env: Env, shops: ManagedShopConfig[]): Promise<void> {
  const statements = [
    env.APP_DB.prepare("DELETE FROM shop_configs"),
    ...shops.map((shop) =>
      env.APP_DB
        .prepare(
          `INSERT INTO shop_configs (
            id, name, family, base_url, fetch_mode, token, workspace_path, enabled, created_at, updated_at
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        )
        .bind(
          shop.id,
          shop.name,
          shop.family,
          shop.baseUrl,
          shop.fetchMode,
          "token" in shop ? shop.token : null,
          "workspacePath" in shop ? shop.workspacePath : null,
          shop.enabled ? 1 : 0,
          shop.createdAt,
          shop.updatedAt
        )
    )
  ];
  await env.APP_DB.batch(statements);
}

async function clearStoredShopConfigs(env: Env): Promise<void> {
  await env.APP_DB.prepare("DELETE FROM shop_configs").run();
}

async function getStoredCatalog(env: Env): Promise<CatalogPayload | null> {
  const current = await getStoredStateJson<CatalogPayload>(env, CATALOG_KEY);
  if (current) {
    return current;
  }
  const legacy = await env.APP_KV.get<CatalogPayload>(CATALOG_KEY, "json");
  if (legacy) {
    await putStoredCatalog(env, legacy);
    return legacy;
  }
  return null;
}

async function putStoredCatalog(env: Env, catalog: CatalogPayload): Promise<void> {
  await putStoredStateJson(env, CATALOG_KEY, catalog);
}

async function getStoredRefreshStatus(env: Env): Promise<RefreshStatus | null> {
  const current = await getStoredStateJson<RefreshStatus>(env, REFRESH_STATUS_KEY);
  if (current) {
    return current;
  }
  const legacy = await env.APP_KV.get<RefreshStatus>(REFRESH_STATUS_KEY, "json");
  if (legacy) {
    await putStoredRefreshStatus(env, legacy);
    return legacy;
  }
  return null;
}

async function putStoredRefreshStatus(env: Env, refresh: RefreshStatus): Promise<void> {
  await putStoredStateJson(env, REFRESH_STATUS_KEY, refresh);
}

async function getStoredSnapshot(env: Env, siteId: string): Promise<ShopSnapshot | null> {
  const row = await env.APP_DB.prepare("SELECT payload FROM shop_snapshots WHERE site_id = ?1").bind(siteId).first<SnapshotRow>();
  const current = parseJsonText<ShopSnapshot>(row?.payload ?? null);
  if (current) {
    return current;
  }

  const legacy = await env.APP_KV.get<ShopSnapshot>(snapshotKey(siteId), "json");
  if (legacy) {
    await putStoredSnapshot(env, legacy);
    return legacy;
  }
  return null;
}

async function loadStoredSnapshots(env: Env, siteIds: string[]): Promise<ShopSnapshot[]> {
  const snapshots = await Promise.all(siteIds.map((siteId) => getStoredSnapshot(env, siteId)));
  return snapshots.filter((snapshot): snapshot is ShopSnapshot => Boolean(snapshot));
}

async function putStoredSnapshot(env: Env, snapshot: ShopSnapshot): Promise<void> {
  await env.APP_DB
    .prepare(
      `INSERT INTO shop_snapshots (
        site_id, site_name, family, source_url, updated_at, item_count, payload
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(site_id) DO UPDATE SET
        site_name = excluded.site_name,
        family = excluded.family,
        source_url = excluded.source_url,
        updated_at = excluded.updated_at,
        item_count = excluded.item_count,
        payload = excluded.payload`
    )
    .bind(
      snapshot.siteId,
      snapshot.siteName,
      snapshot.family,
      snapshot.sourceUrl,
      snapshot.updatedAt,
      snapshot.itemCount,
      JSON.stringify(snapshot)
    )
    .run();
}

async function deleteStoredSnapshot(env: Env, siteId: string): Promise<void> {
  await env.APP_DB.prepare("DELETE FROM shop_snapshots WHERE site_id = ?1").bind(siteId).run();
}

async function clearStoredSnapshots(env: Env): Promise<void> {
  await env.APP_DB.prepare("DELETE FROM shop_snapshots").run();
}

async function getStoredStateJson<T>(env: Env, key: string): Promise<T | null> {
  const row = await env.APP_DB.prepare("SELECT payload FROM app_state WHERE state_key = ?1").bind(key).first<AppStateRow>();
  return parseJsonText<T>(row?.payload ?? null);
}

async function putStoredStateJson<T>(env: Env, key: string, payload: T): Promise<void> {
  await env.APP_DB
    .prepare(
      `INSERT INTO app_state (state_key, payload, updated_at)
       VALUES (?1, ?2, ?3)
       ON CONFLICT(state_key) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`
    )
    .bind(key, JSON.stringify(payload), nowIso())
    .run();
}

async function deleteStoredState(env: Env, key: string): Promise<void> {
  await env.APP_DB.prepare("DELETE FROM app_state WHERE state_key = ?1").bind(key).run();
}

async function getStoredRefreshCursor(env: Env): Promise<number> {
  const value = await getStoredStateJson<number>(env, REFRESH_CURSOR_KEY);
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function putStoredRefreshCursor(env: Env, cursor: number): Promise<void> {
  await putStoredStateJson(env, REFRESH_CURSOR_KEY, cursor);
}

function stripManagedShopConfig(shop: ManagedShopConfig): StoredShopConfig {
  if (shop.family === "shopapi") {
    return {
      id: shop.id,
      name: shop.name,
      family: shop.family,
      baseUrl: shop.baseUrl,
      fetchMode: shop.fetchMode,
      token: shop.token,
      enabled: shop.enabled,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt
    };
  }
  if (shop.family === "nexusvault") {
    return {
      id: shop.id,
      name: shop.name,
      family: shop.family,
      baseUrl: shop.baseUrl,
      fetchMode: shop.fetchMode,
      workspacePath: shop.workspacePath,
      enabled: shop.enabled,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt
    };
  }
  return {
    id: shop.id,
    name: shop.name,
    family: shop.family,
    baseUrl: shop.baseUrl,
    fetchMode: shop.fetchMode,
    enabled: shop.enabled,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt
  };
}

function toManagedShopConfig(
  raw: ShopConfigInput,
  source: "default" | "d1",
  createdAt: string | null,
  updatedAt: string | null,
  defaultEnabled: boolean
): ManagedShopConfig {
  const id = normalizeShopId(raw.id);
  const name = safeString(raw.name);
  const family = safeString(raw.family);
  const baseUrl = normalizeBaseUrl(safeString(raw.baseUrl));
  const enabled = typeof raw.enabled === "boolean" ? raw.enabled : defaultEnabled;
  const fetchMode = normalizeFetchMode(raw.fetchMode, raw, id);

  if (!name) {
    throw new HttpError(400, "shop name is required");
  }

  if (family === "shopapi") {
    const token = safeString(raw.token);
    if (!token) {
      throw new HttpError(400, "shopapi token is required");
    }
    return {
      id,
      name,
      family: "shopapi",
      baseUrl,
      fetchMode,
      token,
      enabled,
      source,
      createdAt,
      updatedAt
    };
  }

  if (family === "acg-like") {
    if (fetchMode !== "worker") {
      throw new HttpError(400, "acg-like only supports worker fetch mode");
    }
    return {
      id,
      name,
      family: "acg-like",
      baseUrl,
      fetchMode,
      enabled,
      source,
      createdAt,
      updatedAt
    };
  }

  if (family === "nexusvault") {
    if (fetchMode !== "worker") {
      throw new HttpError(400, "nexusvault only supports worker fetch mode");
    }
    return {
      id,
      name,
      family: "nexusvault",
      baseUrl,
      fetchMode,
      workspacePath: normalizeWorkspacePath(safeString(raw.workspacePath)),
      enabled,
      source,
      createdAt,
      updatedAt
    };
  }

  if (family === "dujiao-next") {
    if (fetchMode !== "worker") {
      throw new HttpError(400, "dujiao-next only supports worker fetch mode");
    }
    return {
      id,
      name,
      family: "dujiao-next",
      baseUrl,
      fetchMode,
      enabled,
      source,
      createdAt,
      updatedAt
    };
  }

  if (family === "autopixel-rsc") {
    if (fetchMode !== "worker") {
      throw new HttpError(400, "autopixel-rsc only supports worker fetch mode");
    }
    return {
      id,
      name,
      family: "autopixel-rsc",
      baseUrl,
      fetchMode,
      enabled,
      source,
      createdAt,
      updatedAt
    };
  }

  throw new HttpError(400, "unsupported shop family");
}

function normalizeShopId(value: unknown): string {
  const normalized = safeString(value).toLowerCase();
  if (!/^[a-z0-9][a-z0-9-_]{1,63}$/.test(normalized)) {
    throw new HttpError(400, "shop id must match ^[a-z0-9][a-z0-9-_]{1,63}$");
  }
  return normalized;
}

function normalizeBaseUrl(value: string): string {
  if (!value) {
    throw new HttpError(400, "baseUrl is required");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new HttpError(400, "baseUrl is invalid");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new HttpError(400, "baseUrl must start with http or https");
  }
  return parsed.origin;
}

function resolveShopId(raw: ShopConfigInput): string {
  const explicit = safeString(raw.id);
  if (explicit) {
    return normalizeShopId(explicit);
  }

  const family = safeString(raw.family);
  const name = safeString(raw.name);
  const token = safeString(raw.token);
  const workspacePath = safeString(raw.workspacePath);
  const baseUrl = safeString(raw.baseUrl);
  const nameSlug = slugForId(name);
  const hostname = (() => {
    try {
      return baseUrl ? new URL(baseUrl).hostname : "";
    } catch {
      return "";
    }
  })();
  const pathParts = (() => {
    try {
      return baseUrl ? new URL(baseUrl).pathname.split("/").filter(Boolean) : [];
    } catch {
      return [];
    }
  })();

  const parts = [name, family];
  if (family === "shopapi") {
    parts.push(token || (pathParts[0] === "shop" ? pathParts[1] ?? "" : pathParts[pathParts.length - 1] ?? ""));
  } else if (family === "nexusvault") {
    parts.push(workspacePath.split("/").filter(Boolean).at(-1) ?? "");
  } else if (pathParts.length > 0) {
    parts.push(pathParts[pathParts.length - 1]);
  } else if (hostname && shouldAppendHostname(nameSlug, hostname)) {
    parts.push(hostname);
  }

  const slug = parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new HttpError(400, "shop id is required");
  }
  return normalizeShopId(slug);
}

function normalizeFetchMode(value: unknown, raw: ShopConfigInput, shopId: string): FetchMode {
  const mode = safeString(value);
  if (mode === "worker" || mode === "client") {
    return mode;
  }
  const baseUrl = safeString(raw.baseUrl);
  if (baseUrl) {
    try {
      const hostname = new URL(baseUrl).hostname.toLowerCase();
      if (hostname === "pay.ldxp.cn" || hostname.endsWith(".pay.ldxp.cn")) {
        return "client";
      }
    } catch {
      // ignore invalid url here; validation runs elsewhere
    }
  }
  const defaultShop = DEFAULT_SHOP_CONFIG_MAP.get(shopId);
  if (defaultShop?.fetchMode === "client") {
    return "client";
  }
  return "worker";
}

interface ShopPreviewResult {
  baseUrl: string;
  family: SiteFamily | "unknown";
  fetchMode: FetchMode;
  name: string;
  token: string;
  workspacePath: string;
  suggestedId: string;
  title: string;
}

async function previewShopConfig(rawUrl: string, tokenHint: string): Promise<ShopPreviewResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new HttpError(400, "url is invalid");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new HttpError(400, "url must start with http or https");
  }

  const response = await fetch(parsed.toString(), {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": BROWSER_USER_AGENT
    },
    redirect: "follow"
  });
  const html = await response.text();
  const title = extractHtmlTitle(html);
  const familyFromHtml = detectFamilyFromHtml(html);
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  const token = extractShopToken(parsed, tokenHint);

  let family: SiteFamily | "unknown" = familyFromHtml;
  let fetchMode: FetchMode = "worker";
  let name = normalizeTitleGuess(title);
  let workspacePath = "";

  let shopApiProbe: { fetchMode: FetchMode; name: string } | null = null;
  if (family === "unknown" && token && (pathParts[0] === "shop" || /shopApi\/Shop/i.test(html) || isPayLdpxHost(parsed.hostname))) {
    family = "shopapi";
  }

  if (family === "unknown" && token) {
    shopApiProbe = await probeShopApiMode(parsed.origin, token);
    if (shopApiProbe) {
      family = "shopapi";
    }
  }

  if (family === "unknown") {
    try {
      const probe = await probeDujiaoNextShop(parsed.origin);
      family = "dujiao-next";
      name = probe.name;
    } catch {
      // continue probing
    }
  }

  if (family === "unknown") {
    try {
      const probe = await probeAutopixelRscShop(parsed.origin);
      family = "autopixel-rsc";
      name = probe.name;
    } catch {
      // continue probing
    }
  }

  if (family === "shopapi") {
    if (isPayLdpxHost(parsed.hostname)) {
      fetchMode = "client";
      if (!name) {
        name = parsed.hostname;
      }
    } else {
      const probe = shopApiProbe ?? (await probeShopApiMode(parsed.origin, token));
      if (probe) {
        fetchMode = probe.fetchMode;
        if (probe.name) {
          name = probe.name;
        }
      } else {
        throw new HttpError(400, "不在支持范围内");
      }
    }
  } else if (family === "acg-like") {
    fetchMode = "worker";
    if (!name) {
      name = "ACG";
    }
  } else if (family === "nexusvault") {
    fetchMode = "worker";
    workspacePath = extractWorkspacePath(parsed, html);
    if (!name) {
      name = "NexusVault";
    }
  } else if (family === "dujiao-next") {
    fetchMode = "worker";
    const probe = await probeDujiaoNextShop(parsed.origin);
    name = probe.name;
  } else if (family === "autopixel-rsc") {
    fetchMode = "worker";
    const probe = await probeAutopixelRscShop(parsed.origin);
    name = probe.name;
  } else {
    throw new HttpError(400, "不在支持范围内");
  }

  const suggestedId = buildSuggestedShopId({
    name,
    family,
    token,
    workspacePath,
    pathParts,
    hostname: parsed.hostname
  });

  return {
    baseUrl: parsed.origin,
    family,
    fetchMode,
    name,
    token,
    workspacePath,
    suggestedId,
    title
  };
}

function extractHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) {
    return "";
  }
  return match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTitleGuess(value: string): string {
  return value
    .replace(/^(购物|首页|商城|店铺|购买)\s*[-|_·–—]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPayLdpxHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "pay.ldxp.cn" || normalized.endsWith(".pay.ldxp.cn");
}

function detectFamilyFromHtml(html: string): SiteFamily | "unknown" {
  if (/seller-candidates|merchant-rankings|scm_session|workspace\/extract/i.test(html)) {
    return "nexusvault";
  }
  if (/Dujiao-Next|Dujiao-Shop|\/api\/v1\/public\/(config|products|categories)|template_mode|app_version/i.test(html)) {
    return "dujiao-next";
  }
  if (/setVar\("CAT_ID"|trade\.getCommodityList|switch-category|item-search-input|\/user\/api\/index\/(commodity|data)/i.test(html)) {
    return "acg-like";
  }
  if (/输入授权卡密|任务实时状态|订单查询|orders\?channel=retail|Gemini Pixel/i.test(html)) {
    return "autopixel-rsc";
  }
  if (/shopApi\/Shop\/(info|goodsList)|goods_type_sort|category_key/i.test(html)) {
    return "shopapi";
  }
  return "unknown";
}

function extractShopToken(parsed: URL, tokenHint: string): string {
  const explicit = safeString(tokenHint);
  if (explicit) {
    return explicit;
  }
  const pathParts = parsed.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "shop" && pathParts[1]) {
    return pathParts[1];
  }
  return "";
}

function extractWorkspacePath(parsed: URL, html: string): string {
  const htmlMatch = html.match(/workspacePath["'\s:=]+([^\s"'<>]+)/i);
  if (htmlMatch?.[1]) {
    return normalizeWorkspacePath(htmlMatch[1]);
  }
  const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/workspace/extract";
  return normalizeWorkspacePath(path);
}

function buildSuggestedShopId(params: {
  name: string;
  family: SiteFamily | "unknown";
  token: string;
  workspacePath: string;
  pathParts: string[];
  hostname: string;
}): string {
  const nameSlug = slugForId(params.name);
  const parts = [params.name, params.family];
  if (params.family === "shopapi" && params.token) {
    parts.push(params.token);
  } else if (params.family === "nexusvault" && params.workspacePath) {
    parts.push(params.workspacePath.split("/").filter(Boolean).at(-1) ?? "");
  } else if (params.pathParts.length > 0) {
    parts.push(params.pathParts[params.pathParts.length - 1]);
  } else if (params.hostname && shouldAppendHostname(nameSlug, params.hostname)) {
    parts.push(params.hostname);
  }
  const slug = parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new HttpError(400, "shop id is required");
  }
  return normalizeShopId(slug);
}

async function probeShopApiMode(baseUrl: string, token: string): Promise<{ fetchMode: FetchMode; name: string } | null> {
  if (!token) {
    throw new HttpError(400, "不在支持范围内");
  }

  try {
    const response = await fetch(`${baseUrl}/shopApi/Shop/info`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        "cache-control": "no-cache",
        pragma: "no-cache",
        referer: baseUrl,
        "user-agent": BROWSER_USER_AGENT
      },
      body: JSON.stringify({
        token,
        category_key: ""
      })
    });
    const text = await response.text();
    const payload = parseJsonSafe(text);
    if (response.ok && payload && typeof payload === "object" && (payload as any).data) {
      const data = (payload as any).data;
      return {
        fetchMode: "worker",
        name: safeString(data.nickname) || safeString(data.shop_name) || safeString(data.name) || ""
      };
    }
    return {
      fetchMode: "client",
      name: ""
    };
  } catch {
    return {
      fetchMode: "client",
      name: ""
    };
  }
}

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeWorkspacePath(value: string): string {
  if (!value) {
    throw new HttpError(400, "workspacePath is required");
  }
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}` || "/";
  }
  return value.startsWith("/") ? value : `/${value}`;
}

function sortShops<T extends ManagedShopConfig>(shops: T[]): T[] {
  return [...shops].sort((left, right) => {
    if (left.enabled !== right.enabled) {
      return left.enabled ? -1 : 1;
    }
    const familyCompare = left.family.localeCompare(right.family, "en");
    if (familyCompare !== 0) {
      return familyCompare;
    }
    return left.name.localeCompare(right.name, "zh-CN");
  });
}

async function buildItemDetailPayload(
  env: Env,
  siteId: string,
  itemId: string,
  page: number,
  limit: number
): Promise<NexusVaultDetailPayload> {
  const item = await findCatalogItem(env, siteId, itemId);
  if (!item) {
    throw new HttpError(404, "item not found");
  }
  if (item.family !== "nexusvault") {
    throw new HttpError(400, "detail page only supports nexusvault items");
  }
  if (!item.externalId) {
    throw new HttpError(400, "merchant id is missing");
  }

  const shop = await getNexusVaultShop(env, siteId);
  const response = await fetchNexusVaultSellerDetails(env, shop, item.externalId, page, limit);

  return {
    item,
    merchantId: safeString(response.merchant_id) || item.externalId,
    startDate: safeString(response.start_date) || null,
    startAt: safeString(response.start_at) || null,
    updatedAt: safeString(response.updated_at) || null,
    rows: Array.isArray(response.details) ? response.details.map((row) => normalizeNexusVaultDetailRow(row)) : [],
    pagination: normalizePagination(response.pagination, page, limit)
  };
}

async function findCatalogItem(env: Env, siteId: string, itemId: string): Promise<CatalogItem | null> {
  const catalog = await ensureCatalog(env);
  const fromCatalog = catalog.items.find((item) => item.siteId === siteId && item.id === itemId);
  if (fromCatalog) {
    return fromCatalog;
  }

  const snapshot = await getStoredSnapshot(env, siteId);
  if (!snapshot) {
    return null;
  }
  return snapshot.items.find((item) => item.id === itemId) ?? null;
}

async function getNexusVaultShop(env: Env, siteId: string): Promise<NexusVaultConfig> {
  const shops = await getRuntimeShops(env);
  const shop = shops.find((candidate): candidate is ManagedShopConfig & NexusVaultConfig => candidate.id === siteId && candidate.family === "nexusvault");
  if (!shop) {
    throw new HttpError(404, "nexusvault shop not found");
  }
  return shop;
}

async function fetchShopApiShop(shop: ShopApiConfig): Promise<ShopSnapshot> {
  const info = await postJson<{
    code: number;
    data: {
      nickname?: string;
      link?: string;
      goods_type_sort?: string[];
      card_count?: number;
      article_count?: number;
      resource_count?: number;
      equity_count?: number;
    };
  }>(`${shop.baseUrl}/shopApi/Shop/info`, {
    token: shop.token,
    category_key: ""
  });

  const types = (info.data.goods_type_sort ?? ["card", "article", "resource", "equity"]).filter((type) => {
    const countMap: Record<string, number | undefined> = {
      card: info.data.card_count,
      article: info.data.article_count,
      resource: info.data.resource_count,
      equity: info.data.equity_count
    };
    return (countMap[type] ?? 0) > 0;
  });

  const pages = await Promise.all(
    types.map(async (goodsType) => {
      const rows = await collectPaginatedShopApiGoods(shop, goodsType);
      return rows.map((row) => normalizeShopApiItem(shop, info.data.nickname ?? shop.name, row));
    })
  );

  const items = pages.flat();
  const updatedAt = nowIso();

  return {
    siteId: shop.id,
    siteName: info.data.nickname ?? shop.name,
    family: shop.family,
    sourceUrl: info.data.link ?? `${shop.baseUrl}/shop/${shop.token}`,
    updatedAt,
    itemCount: items.length,
    items: items.map((item) => ({ ...item, updatedAt }))
  };
}

async function collectPaginatedShopApiGoods(shop: ShopApiConfig, goodsType: string): Promise<any[]> {
  const pageSize = 100;
  let current = 1;
  let total = 0;
  const collected: any[] = [];

  do {
    const response = await postJson<{
      code: number;
      data: {
        total: number;
        list: any[];
      };
    }>(`${shop.baseUrl}/shopApi/Shop/goodsList`, {
      token: shop.token,
      keywords: "",
      category_id: 0,
      goods_type: goodsType,
      current,
      pageSize
    });
    total = response.data.total ?? 0;
    collected.push(...(response.data.list ?? []));
    current += 1;
  } while (collected.length < total && current <= 20);

  return collected;
}

function normalizeShopApiItem(shop: ShopApiConfig, siteName: string, row: any): CatalogItem {
  const stockExact = numberOrNull(row.extend?.stock_count);
  return {
    id: `${shop.id}:${row.goods_type ?? "goods"}:${row.goods_key ?? row.name}`,
    siteId: shop.id,
    siteName,
    family: "shopapi",
    externalId: safeString(row.goods_key) || null,
    title: safeString(row.name),
    category: safeString(row.category?.name) || safeString(row.goods_type) || "未分类",
    price: numberOrNull(row.price),
    marketPrice: numberOrNull(row.market_price),
    stockExact,
    stockDisplay: stockExact === null ? null : String(stockExact),
    stockState: inferStockState(stockExact, stockExact === null ? null : String(stockExact)),
    soldCount: null,
    minOrderQuantity: numberOrNull(row.extend?.limit_count),
    imageUrl: safeString(row.image) || null,
    description: summarizeHtml(row.description),
    sourceUrl: safeString(row.link) || `${shop.baseUrl}/shop/${shop.token}`,
    detailPath: null,
    updatedAt: ""
  };
}

async function fetchAcgLikeShop(shop: AcgLikeConfig): Promise<ShopSnapshot> {
  const categoriesResponse = await getJson<{
    code: number;
    data: Array<{ id: number; name: string; commodity_count?: number }>;
  }>(`${shop.baseUrl}/user/api/index/data`);

  const categories = categoriesResponse.data ?? [];
  const groups = await Promise.all(
    categories.map(async (category) => {
      const rows = await collectPaginatedAcgGoods(shop, category.id);
      return rows.map((row) => normalizeAcgItem(shop, row, category.name));
    })
  );

  const items = groups.flat();
  const updatedAt = nowIso();

  return {
    siteId: shop.id,
    siteName: shop.name,
    family: shop.family,
    sourceUrl: shop.baseUrl,
    updatedAt,
    itemCount: items.length,
    items: items.map((item) => ({ ...item, updatedAt }))
  };
}

async function probeDujiaoNextShop(baseUrl: string): Promise<{ name: string }> {
  const config = await getJson<{
    status_code?: number;
    data?: Record<string, unknown>;
  }>(`${baseUrl}/api/v1/public/config`);
  const products = await getJson<{
    data?: any[];
    pagination?: { total?: number; total_page?: number };
  }>(`${baseUrl}/api/v1/public/products?page=1&page_size=1`);

  if (!Array.isArray(products.data)) {
    throw new HttpError(400, "不在支持范围内");
  }

  return {
    name: pickDujiaoSiteName(config.data, baseUrl)
  };
}

async function fetchDujiaoNextShop(shop: DujiaoNextConfig): Promise<ShopSnapshot> {
  const [config, rows] = await Promise.all([
    getJson<{
      status_code?: number;
      data?: Record<string, unknown>;
    }>(`${shop.baseUrl}/api/v1/public/config`),
    collectPaginatedDujiaoProducts(shop)
  ]);
  const siteName = pickDujiaoSiteName(config.data, shop.baseUrl) || shop.name;
  const updatedAt = nowIso();
  const items = rows.flatMap((row) => normalizeDujiaoItems(shop, siteName, row));

  return {
    siteId: shop.id,
    siteName,
    family: shop.family,
    sourceUrl: shop.baseUrl,
    updatedAt,
    itemCount: items.length,
    items: items.map((item) => ({ ...item, updatedAt }))
  };
}

async function collectPaginatedDujiaoProducts(shop: DujiaoNextConfig): Promise<any[]> {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const collected: any[] = [];

  do {
    const response = await getJson<{
      data?: any[];
      pagination?: {
        total?: number;
        total_page?: number;
      };
    }>(`${shop.baseUrl}/api/v1/public/products?page=${page}&page_size=${pageSize}`);
    const rows = Array.isArray(response.data) ? response.data : [];
    collected.push(...rows);
    totalPages = Math.max(1, numberOrNull(response.pagination?.total_page) ?? totalPages);
    const total = numberOrNull(response.pagination?.total);
    if (total !== null && collected.length >= total) {
      break;
    }
    page += 1;
  } while (page <= totalPages && page <= 20);

  return collected;
}

function normalizeDujiaoItems(shop: DujiaoNextConfig, siteName: string, row: any): CatalogItem[] {
  const productExternalId = row?.id === undefined || row?.id === null ? null : String(row.id);
  const title = localizedText(row?.title) || safeString(row?.slug) || `商品 ${productExternalId || "unknown"}`;
  const category = localizedText(row?.category?.name) || safeString(row?.category?.slug) || "未分类";
  const sourceUrl = safeString(row?.slug) ? absoluteUrl(shop.baseUrl, `/products/${safeString(row.slug)}`) : shop.baseUrl;
  const imageUrl = Array.isArray(row?.images) && safeString(row.images[0]) ? absoluteUrl(shop.baseUrl, row.images[0]) : null;
  const description =
    summarizeHtml(localizedText(row?.description)) ??
    summarizeHtml(localizedText(row?.content)) ??
    summarizeHtml(row?.wholesale_description);
  const minOrderQuantity = normalizeMinOrderQuantity(row?.min_purchase_quantity);
  const skus = Array.isArray(row?.skus) ? row.skus.filter((item: any) => item && item.is_active !== false) : [];

  if (!skus.length) {
    const stockExact = resolveDujiaoStock(row);
    return [
      {
        id: `${shop.id}:product:${productExternalId || slugForId(title)}`,
        siteId: shop.id,
        siteName,
        family: "dujiao-next",
        externalId: productExternalId,
        title,
        category,
        price: numberOrNull(row?.price_amount),
        marketPrice: null,
        stockExact,
        stockDisplay: stockExact === null ? null : String(stockExact),
        stockState: inferDujiaoStockState(row, stockExact),
        soldCount: null,
        minOrderQuantity,
        imageUrl,
        description,
        sourceUrl,
        detailPath: null,
        updatedAt: ""
      }
    ];
  }

  return skus.map((sku: any) => {
    const skuLabel = localizedText(sku?.spec_values) || safeString(sku?.sku_code);
    const stockExact = resolveDujiaoStock(sku, row);
    return {
      id: `${shop.id}:product:${productExternalId || slugForId(title)}:sku:${sku?.id === undefined || sku?.id === null ? safeString(sku?.sku_code) || slugForId(skuLabel || title) : String(sku.id)}`,
      siteId: shop.id,
      siteName,
      family: "dujiao-next",
      externalId: sku?.id === undefined || sku?.id === null ? (row?.id === undefined || row?.id === null ? null : String(row.id)) : String(sku.id),
      title: skuLabel ? `${title} / ${skuLabel}` : title,
      category,
      price: numberOrNull(sku?.price_amount) ?? numberOrNull(row?.price_amount),
      marketPrice: null,
      stockExact,
      stockDisplay: stockExact === null ? null : String(stockExact),
      stockState: inferDujiaoStockState(sku, stockExact, row),
      soldCount: null,
      minOrderQuantity,
      imageUrl,
      description,
      sourceUrl,
      detailPath: null,
      updatedAt: ""
    } satisfies CatalogItem;
  });
}

function pickDujiaoSiteName(data: Record<string, unknown> | undefined, baseUrl: string): string {
  return (
    localizedText(data?.brand && typeof data.brand === "object" ? (data.brand as Record<string, unknown>).site_name : null) ||
    localizedText(data?.seo && typeof data.seo === "object" ? (data.seo as Record<string, unknown>).title : null) ||
    new URL(baseUrl).hostname
  );
}

function resolveDujiaoStock(row: any, fallbackRow?: any): number | null {
  const candidates = [row?.auto_stock_available, row?.manual_stock_available, row?.upstream_stock];
  const values = candidates
    .map((value) => numberOrNull(value))
    .filter((value): value is number => value !== null && value >= 0);
  if (values.length > 0) {
    return values.reduce((sum, value) => sum + value, 0);
  }

  const total = numberOrNull(row?.manual_stock_total);
  const sold = numberOrNull(row?.manual_stock_sold);
  if (total !== null) {
    return Math.max(0, total - (sold ?? 0));
  }

  if (fallbackRow) {
    return resolveDujiaoStock(fallbackRow);
  }

  return null;
}

function inferDujiaoStockState(row: any, stockExact: number | null, fallbackRow?: any): "in_stock" | "sold_out" | "unknown" {
  if (row?.is_sold_out === true || row?.is_active === false) {
    return "sold_out";
  }
  const status = safeString(row?.stock_status);
  if (status === "in_stock") {
    return "in_stock";
  }
  if (status === "sold_out" || status === "out_of_stock") {
    return "sold_out";
  }
  if (fallbackRow) {
    return inferDujiaoStockState(fallbackRow, stockExact);
  }
  return inferStockState(stockExact, stockExact === null ? null : String(stockExact));
}

async function probeAutopixelRscShop(baseUrl: string): Promise<{ name: string }> {
  const shopHtml = await getText(absoluteUrl(baseUrl, AUTOPIXEL_SHOP_PATH));
  const actions = await discoverAutopixelRscActions(baseUrl, shopHtml);
  const payload = await callAutopixelRscAction(baseUrl, actions.productsAction, "[]");
  const rows = extractAutopixelProducts(payload);
  if (!rows.length) {
    throw new HttpError(400, "不在支持范围内");
  }
  return {
    name: normalizeTitleGuess(extractHtmlTitle(shopHtml)) || new URL(baseUrl).hostname
  };
}

async function fetchAutopixelRscShop(shop: AutopixelRscConfig): Promise<ShopSnapshot> {
  const shopHtml = await getText(absoluteUrl(shop.baseUrl, AUTOPIXEL_SHOP_PATH));
  const actions = await discoverAutopixelRscActions(shop.baseUrl, shopHtml);
  const payload = await callAutopixelRscAction(shop.baseUrl, actions.productsAction, "[]");
  const rows = extractAutopixelProducts(payload);
  const siteName = normalizeTitleGuess(extractHtmlTitle(shopHtml)) || shop.name;
  const updatedAt = nowIso();
  const items = rows.map((row) => normalizeAutopixelItem(shop, siteName, row));

  return {
    siteId: shop.id,
    siteName,
    family: shop.family,
    sourceUrl: absoluteUrl(shop.baseUrl, AUTOPIXEL_SHOP_PATH),
    updatedAt,
    itemCount: items.length,
    items: items.map((item) => ({ ...item, updatedAt }))
  };
}

async function discoverAutopixelRscActions(baseUrl: string, shopHtml?: string): Promise<{ productsAction: string }> {
  const html = shopHtml ?? (await getText(absoluteUrl(baseUrl, AUTOPIXEL_SHOP_PATH)));
  const scriptUrls = extractScriptUrlsFromHtml(html, baseUrl).filter((url) => url.includes("/_next/static/chunks/"));
  const actionIds = new Set<string>();

  await Promise.all(
    scriptUrls.map(async (scriptUrl) => {
      try {
        const text = await getText(scriptUrl);
        for (const match of text.matchAll(/\b[0-9a-f]{42}\b/g)) {
          actionIds.add(match[0]);
        }
      } catch {
        // ignore transient script fetch failures during discovery
      }
    })
  );

  for (const actionId of actionIds) {
    try {
      const payload = await callAutopixelRscAction(baseUrl, actionId, "[]");
      const rows = extractAutopixelProducts(payload, false);
      if (rows.length > 0) {
        return { productsAction: actionId };
      }
    } catch {
      // ignore non-product actions
    }
  }

  throw new HttpError(400, "不在支持范围内");
}

async function callAutopixelRscAction(baseUrl: string, actionId: string, body: string): Promise<unknown> {
  const text = await postTextWithHeaders(absoluteUrl(baseUrl, AUTOPIXEL_SHOP_PATH), body, {
    accept: "text/x-component",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "text/plain;charset=UTF-8",
    "next-action": actionId,
    "next-router-state-tree": AUTOPIXEL_ROUTER_STATE_TREE,
    pragma: "no-cache",
    referer: absoluteUrl(baseUrl, AUTOPIXEL_SHOP_PATH),
    "user-agent": BROWSER_USER_AGENT
  });
  return parseRscPayload(text);
}

function extractAutopixelProducts(payload: unknown, throwOnInvalid = true): any[] {
  if (!payload || typeof payload !== "object") {
    if (throwOnInvalid) {
      throw new Error("autopixel payload is invalid");
    }
    return [];
  }
  const rows = Array.isArray((payload as any).data) ? (payload as any).data : [];
  const productRows = rows.filter(
    (row: any) =>
      row &&
      typeof row === "object" &&
      "price" in row &&
      "stock_count" in row &&
      (safeString(row.name) || safeString(row.category))
  );
  if (throwOnInvalid && productRows.length === 0) {
    throw new Error("autopixel products payload is empty");
  }
  return productRows;
}

function normalizeAutopixelItem(shop: AutopixelRscConfig, siteName: string, row: any): CatalogItem {
  const stockExact = numberOrNull(row?.stock_count);
  const externalId = row?.id === undefined || row?.id === null ? null : String(row.id);
  return {
    id: `${shop.id}:product:${externalId || slugForId(safeString(row?.name))}`,
    siteId: shop.id,
    siteName,
    family: "autopixel-rsc",
    externalId,
    title: safeString(row?.name) || "未命名商品",
    category: safeString(row?.category) || "未分类",
    price: numberOrNull(row?.price),
    marketPrice: null,
    stockExact,
    stockDisplay: stockExact === null ? null : String(stockExact),
    stockState: inferStockState(stockExact, stockExact === null ? null : String(stockExact)),
    soldCount: numberOrNull(row?.sold_count),
    minOrderQuantity: 1,
    imageUrl: safeString(row?.image_url) ? absoluteUrl(shop.baseUrl, row.image_url) : null,
    description: summarizeHtml(row?.description) ?? summarizeHtml(row?.wholesale_description),
    sourceUrl: absoluteUrl(shop.baseUrl, AUTOPIXEL_SHOP_PATH),
    detailPath: null,
    updatedAt: ""
  };
}

function extractScriptUrlsFromHtml(html: string, baseUrl: string): string[] {
  return Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/gi)).map((match) => absoluteUrl(baseUrl, match[1]));
}

function parseRscPayload(text: string): unknown {
  let fallback: unknown = null;
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\d+:(.+)$/);
    if (!match) {
      continue;
    }
    const body = match[1];
    if (body.startsWith("E")) {
      continue;
    }
    const payload = parseJsonSafe(body);
    if (payload && typeof payload === "object") {
      if ("data" in (payload as Record<string, unknown>) || "success" in (payload as Record<string, unknown>) || "isAdmin" in (payload as Record<string, unknown>)) {
        return payload;
      }
      fallback = payload;
    }
  }
  if (fallback) {
    return fallback;
  }
  throw new Error("Upstream RSC payload parse failed");
}

function localizedText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (!value || typeof value !== "object") {
    return "";
  }
  const record = value as Record<string, unknown>;
  for (const key of ["zh-CN", "zh_CN", "zh-TW", "zh_TW", "en-US", "en_US"]) {
    const candidate = safeString(record[key]);
    if (candidate) {
      return candidate;
    }
  }
  for (const candidate of Object.values(record)) {
    const text = safeString(candidate);
    if (text) {
      return text;
    }
  }
  return "";
}

function normalizeMinOrderQuantity(value: unknown): number | null {
  const count = numberOrNull(value);
  if (count === null) {
    return 1;
  }
  return count > 0 ? count : 1;
}

function slugForId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function shouldAppendHostname(nameSlug: string, hostname: string): boolean {
  const hostnameSlug = slugForId(hostname);
  if (!hostnameSlug) {
    return false;
  }
  return !nameSlug || !nameSlug.includes(hostnameSlug);
}

async function fetchNexusVaultShop(env: Env, shop: NexusVaultConfig): Promise<ShopSnapshot> {
  const { scmSession } = await resolveNexusVaultSession(env, shop.id);

  const response = await getJsonWithHeaders<{
    sellers?: any[];
  }>(`${shop.baseUrl}/api/workspace/seller-candidates`, {
    accept: "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    pragma: "no-cache",
    referer: absoluteUrl(shop.baseUrl, shop.workspacePath),
    cookie: `scm_session=${scmSession}`,
    "user-agent": BROWSER_USER_AGENT
  });

  const items = (response.sellers ?? []).map((seller) => normalizeNexusVaultSeller(shop, seller));
  const updatedAt = nowIso();

  return {
    siteId: shop.id,
    siteName: shop.name,
    family: shop.family,
    sourceUrl: absoluteUrl(shop.baseUrl, shop.workspacePath),
    updatedAt,
    itemCount: items.length,
    items: items.map((item) => ({ ...item, updatedAt }))
  };
}

function normalizeNexusVaultSeller(shop: NexusVaultConfig, seller: any): CatalogItem {
  const merchantId = safeString(seller.id);
  const fallbackId = merchantId || safeString(seller.username) || safeString(seller.name) || "unknown";
  const itemId = `${shop.id}:seller:${fallbackId}`;
  const priceMin = numberOrNull(seller.price_min_cents);
  const priceMax = numberOrNull(seller.price_max_cents);
  const qualityLabel = safeString(seller.quality_label) || "未知";
  const availabilityLabel = safeString(seller.availability_label) || "未知";
  const credentialTags = Array.isArray(seller.credential_tags)
    ? seller.credential_tags.map((item: unknown) => safeString(item)).filter(Boolean)
    : [];
  const warrantyTags = Array.isArray(seller.warranty_tags)
    ? seller.warranty_tags.map((item: unknown) => safeString(item)).filter(Boolean)
    : [];
  const detailParts = [
    `供货状态：${availabilityLabel}`,
    `质量标签：${qualityLabel}`,
    typeof seller.quality_score === "number" ? `质量分：${seller.quality_score}` : "",
    typeof seller.active_rate_percent === "number" ? `有效率：${seller.active_rate_percent}%` : "",
    typeof seller.invalid_rate_percent === "number" ? `失效率：${seller.invalid_rate_percent}%` : "",
    credentialTags.length ? `凭据标签：${credentialTags.join(" / ")}` : "",
    warrantyTags.length ? `质保标签：${warrantyTags.join(" / ")}` : ""
  ].filter(Boolean);

  return {
    id: itemId,
    siteId: shop.id,
    siteName: shop.name,
    family: "nexusvault",
    externalId: merchantId || null,
    title: safeString(seller.display_name) || safeString(seller.name) || safeString(seller.username) || "未命名商家",
    category: "NexusVault 商家候选",
    price: priceMin === null ? null : centsToYuan(priceMin),
    marketPrice: priceMax === null || priceMax === priceMin ? null : centsToYuan(priceMax),
    stockExact: null,
    stockDisplay: availabilityLabel || null,
    stockState: inferNexusVaultStockState(safeString(seller.availability_level), availabilityLabel),
    soldCount: null,
    minOrderQuantity: 1,
    imageUrl: null,
    description: detailParts.join("；"),
    sourceUrl: absoluteUrl(shop.baseUrl, shop.workspacePath),
    detailPath: merchantId ? `/detail?siteId=${encodeURIComponent(shop.id)}&itemId=${encodeURIComponent(itemId)}` : null,
    updatedAt: ""
  };
}

function inferNexusVaultStockState(level: string, label: string | null): "in_stock" | "sold_out" | "unknown" {
  const normalized = level.trim().toLowerCase();
  if (["ample", "normal", "low"].includes(normalized)) {
    return "in_stock";
  }
  if (["empty", "none", "sold_out", "unavailable"].includes(normalized)) {
    return "sold_out";
  }
  return inferStockState(null, label);
}

async function collectPaginatedAcgGoods(shop: AcgLikeConfig, categoryId: number): Promise<any[]> {
  const limit = 100;
  let page = 1;
  let total = 0;
  const collected: any[] = [];

  do {
    const response = await getJson<{
      code: number;
      total?: number;
      data: any[];
    }>(`${shop.baseUrl}/user/api/index/commodity?categoryId=${categoryId}&limit=${limit}&page=${page}`);
    total = response.total ?? response.data?.length ?? 0;
    collected.push(...(response.data ?? []));
    page += 1;
  } while (collected.length < total && page <= 20);

  return collected;
}

function normalizeAcgItem(shop: AcgLikeConfig, row: any, fallbackCategory: string): CatalogItem {
  const numericStock = typeof row.stock === "number" ? row.stock : null;
  const stockDisplay =
    typeof row.stock === "string"
      ? row.stock
      : typeof row.stock === "number"
        ? String(row.stock)
        : null;

  const stockState = (() => {
    if (row.stock_state === 0) {
      return "sold_out";
    }
    if (row.stock_state === 3) {
      return "in_stock";
    }
    return inferStockState(numericStock, stockDisplay);
  })();

  return {
    id: `${shop.id}:commodity:${row.id}`,
    siteId: shop.id,
    siteName: shop.name,
    family: "acg-like",
    externalId: row.id === undefined || row.id === null ? null : String(row.id),
    title: safeString(row.name),
    category: safeString(row.category?.name) || fallbackCategory || "未分类",
    price: numberOrNull(row.user_price ?? row.price),
    marketPrice: numberOrNull(row.price),
    stockExact: numericStock,
    stockDisplay,
    stockState,
    soldCount: numberOrNull(row.order_sold),
    minOrderQuantity: 1,
    imageUrl: safeString(row.cover) ? absoluteUrl(shop.baseUrl, row.cover) : null,
    description: row.inventory_hidden ? "该站点当前只公开库存状态，不公开精确库存。" : null,
    sourceUrl: `${shop.baseUrl}/item/${row.id}`,
    detailPath: null,
    updatedAt: ""
  };
}

async function assertAdmin(request: Request, env: Env): Promise<void> {
  const session = await requireAdminSession(request, env);
  if (!session) {
    throw new HttpError(401, "unauthorized");
  }
}

async function requireAccessSession(
  request: Request,
  env: Env,
  verifyCredential: boolean
): Promise<CredentialRecord | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[ACCESS_COOKIE];
  if (!token) {
    return null;
  }
  const payload = await verifySignedCookie(env, token);
  if (!payload || payload.type !== "access" || payload.exp <= unixNow()) {
    return null;
  }
  if (!verifyCredential) {
    return {
      note: "",
      enabled: true,
      createdAt: "",
      updatedAt: "",
      lastUsedAt: null
    };
  }
  const record = await getCredential(env, payload.hash);
  if (!record || !record.enabled) {
    return null;
  }
  return record;
}

async function requireAdminSession(request: Request, env: Env): Promise<AdminSessionPayload | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[ADMIN_COOKIE];
  if (!token) {
    return null;
  }
  const payload = await verifySignedCookie(env, token);
  if (!payload || payload.type !== "admin" || payload.exp <= unixNow()) {
    return null;
  }
  return payload;
}

async function upsertCredential(
  env: Env,
  rawCredential: string,
  note: string,
  enabled: boolean
): Promise<{ ok: true; created: boolean; hash: string }> {
  const hash = await sha256Hex(rawCredential.trim());
  const existing = await getCredential(env, hash);
  const record: CredentialRecord = {
    note: note.trim(),
    enabled,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    lastUsedAt: existing?.lastUsedAt ?? null
  };
  await putCredential(env, hash, record);
  return {
    ok: true,
    created: !existing,
    hash
  };
}

async function toggleCredential(env: Env, hash: string, enabled: boolean): Promise<boolean> {
  const existing = await getCredential(env, hash);
  if (!existing) {
    return false;
  }
  await putCredential(env, hash, {
    ...existing,
    enabled,
    updatedAt: nowIso()
  });
  return true;
}

async function updateCredential(
  env: Env,
  hash: string,
  patch: { note?: string; enabled?: boolean }
): Promise<boolean> {
  const existing = await getCredential(env, hash);
  if (!existing) {
    return false;
  }
  await putCredential(env, hash, {
    ...existing,
    note: typeof patch.note === "string" ? patch.note.trim() : existing.note,
    enabled: typeof patch.enabled === "boolean" ? patch.enabled : existing.enabled,
    updatedAt: nowIso()
  });
  return true;
}

async function listCredentials(env: Env): Promise<Array<CredentialRecord & { hash: string }>> {
  const rows: Array<CredentialRecord & { hash: string }> = [];
  let cursor: string | undefined;

  do {
    const page = await env.APP_KV.list({ prefix: "credential:", cursor });
    const batch = await Promise.all(
      page.keys.map(async (key) => {
        const record = await env.APP_KV.get<CredentialRecord>(key.name, "json");
        if (!record) {
          return null;
        }
        return {
          hash: key.name.replace("credential:", ""),
          ...record
        };
      })
    );
    rows.push(...batch.filter((item): item is CredentialRecord & { hash: string } => Boolean(item)));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return rows.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

async function listPlatformConfigs(env: Env): Promise<PlatformConfigSummary[]> {
  const shops = await getRuntimeShops(env);
  return Promise.all(
    shops.filter((shop): shop is ManagedShopConfig & NexusVaultConfig => shop.family === "nexusvault").map(async (shop) => {
      const kvRecord = await getNexusVaultConfigRecord(env, shop.id);
      const envSession = (env.NEXUSVAULT_SCM_SESSION ?? "").trim();
      if (kvRecord?.scmSession) {
        return {
          siteId: shop.id,
          siteName: shop.name,
          family: shop.family,
          configured: true,
          source: "kv",
          updatedAt: kvRecord.updatedAt,
          preview: maskSecret(kvRecord.scmSession)
        } satisfies PlatformConfigSummary;
      }
      if (envSession) {
        return {
          siteId: shop.id,
          siteName: shop.name,
          family: shop.family,
          configured: true,
          source: "env",
          updatedAt: null,
          preview: maskSecret(envSession)
        } satisfies PlatformConfigSummary;
      }
      return {
        siteId: shop.id,
        siteName: shop.name,
        family: shop.family,
        configured: false,
        source: "none",
        updatedAt: null,
        preview: null
      } satisfies PlatformConfigSummary;
    })
  );
}

async function saveNexusVaultConfig(env: Env, siteId: string, scmSession: string): Promise<void> {
  await getNexusVaultShop(env, siteId);
  const normalized = scmSession.trim();
  if (!normalized) {
    throw new HttpError(400, "scmSession is required");
  }
  const record: NexusVaultPlatformConfigRecord = {
    scmSession: normalized,
    updatedAt: nowIso()
  };
  await env.APP_KV.put(platformConfigKey(siteId), JSON.stringify(record));
}

async function clearPlatformConfig(env: Env, siteId: string): Promise<void> {
  await getNexusVaultShop(env, siteId);
  await env.APP_KV.delete(platformConfigKey(siteId));
}

async function resolveNexusVaultSession(
  env: Env,
  siteId: string
): Promise<{ scmSession: string; source: "kv" | "env"; updatedAt: string | null }> {
  const kvRecord = await getNexusVaultConfigRecord(env, siteId);
  if (kvRecord?.scmSession) {
    return {
      scmSession: kvRecord.scmSession,
      source: "kv",
      updatedAt: kvRecord.updatedAt
    };
  }

  const envSession = (env.NEXUSVAULT_SCM_SESSION ?? "").trim();
  if (envSession) {
    return {
      scmSession: envSession,
      source: "env",
      updatedAt: null
    };
  }

  throw new Error(`NexusVault scm_session is not configured for ${siteId}`);
}

async function getNexusVaultConfigRecord(env: Env, siteId: string): Promise<NexusVaultPlatformConfigRecord | null> {
  const record = await env.APP_KV.get<NexusVaultPlatformConfigRecord>(platformConfigKey(siteId), "json");
  if (!record?.scmSession) {
    return null;
  }
  return {
    scmSession: record.scmSession.trim(),
    updatedAt: safeString(record.updatedAt) || nowIso()
  };
}

function platformConfigKey(siteId: string): string {
  return `${PLATFORM_CONFIG_PREFIX}${siteId}`;
}

function maskSecret(secret: string): string {
  const normalized = secret.trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= 16) {
    return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
  }
  return `${normalized.slice(0, 8)}...${normalized.slice(-6)}`;
}

async function verifyAdminPassword(env: Env, password: string): Promise<boolean> {
  const record = await getAdminPasswordRecord(env);
  if (record) {
    return verifyAdminPasswordRecord(password, record);
  }
  if (!env.ADMIN_PASSWORD) {
    throw new HttpError(500, "ADMIN_PASSWORD is not configured");
  }
  return password === env.ADMIN_PASSWORD;
}

async function getAdminPasswordRecord(env: Env): Promise<AdminPasswordRecord | null> {
  const record = await env.APP_KV.get<AdminPasswordRecord>(ADMIN_PASSWORD_KEY, "json");
  if (
    !record ||
    record.version !== 1 ||
    record.algorithm !== "pbkdf2-sha256" ||
    typeof record.iterations !== "number" ||
    typeof record.salt !== "string" ||
    typeof record.hash !== "string"
  ) {
    return null;
  }
  return record;
}

async function createAdminPasswordRecord(password: string): Promise<AdminPasswordRecord> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await deriveAdminPasswordHash(password, salt, ADMIN_PASSWORD_ITERATIONS);
  return {
    version: 1,
    algorithm: "pbkdf2-sha256",
    iterations: ADMIN_PASSWORD_ITERATIONS,
    salt: base64UrlEncode(salt),
    hash: base64UrlEncode(hash),
    updatedAt: nowIso()
  };
}

async function verifyAdminPasswordRecord(password: string, record: AdminPasswordRecord): Promise<boolean> {
  const salt = base64UrlDecode(record.salt);
  const expected = base64UrlDecode(record.hash);
  if (salt.length === 0 || expected.length === 0) {
    return false;
  }
  const actual = await deriveAdminPasswordHash(password, salt, record.iterations);
  return timingSafeEqual(actual, expected);
}

async function deriveAdminPasswordHash(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations
    },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

async function getCredential(env: Env, hash: string): Promise<CredentialRecord | null> {
  return (await env.APP_KV.get<CredentialRecord>(credentialKey(hash), "json")) ?? null;
}

async function putCredential(env: Env, hash: string, record: CredentialRecord): Promise<void> {
  await env.APP_KV.put(credentialKey(hash), JSON.stringify(record));
}

function credentialKey(hash: string): string {
  return `credential:${hash}`;
}

function snapshotKey(siteId: string): string {
  return `shop:${siteId}:snapshot`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json,text/plain,*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      "user-agent": BROWSER_USER_AGENT
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Upstream POST failed ${response.status}: ${url}`);
  }
  return (await response.json()) as T;
}

async function postTextWithHeaders(url: string, body: string, headers: Record<string, string>): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body
  });
  if (!response.ok) {
    throw new Error(`Upstream POST failed ${response.status}: ${url}`);
  }
  return response.text();
}

async function getJson<T>(url: string): Promise<T> {
  return getJsonWithHeaders<T>(url, {
    accept: "application/json,text/plain,*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "user-agent": BROWSER_USER_AGENT
  });
}

async function getJsonWithHeaders<T>(url: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    headers
  });
  if (!response.ok) {
    throw new Error(`Upstream GET failed ${response.status}: ${url}`);
  }
  return (await response.json()) as T;
}

async function getText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": BROWSER_USER_AGENT
    }
  });
  if (!response.ok) {
    throw new Error(`Upstream GET failed ${response.status}: ${url}`);
  }
  return response.text();
}

async function fetchNexusVaultSellerDetails(
  env: Env,
  shop: NexusVaultConfig,
  merchantId: string,
  page: number,
  limit: number
): Promise<{
  merchant_id?: string;
  start_date?: string;
  start_at?: string;
  updated_at?: string;
  details?: any[];
  pagination?: Record<string, unknown>;
}> {
  const { scmSession } = await resolveNexusVaultSession(env, shop.id);
  return getJsonWithHeaders(
    `${shop.baseUrl}/api/merchant-rankings/${encodeURIComponent(merchantId)}/details?page=${page}&limit=${limit}`,
    {
      accept: "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      referer: absoluteUrl(shop.baseUrl, shop.workspacePath),
      cookie: `scm_session=${scmSession}`,
      "user-agent": BROWSER_USER_AGENT
    }
  );
}

function normalizeNexusVaultDetailRow(row: any): NexusVaultSellerDetailRow {
  return {
    orderId: safeString(row.order_id) || safeString(row.order_ref) || "-",
    orderRef: safeString(row.order_ref) || "-",
    cardId: safeString(row.card_id) || null,
    cardRef: safeString(row.card_ref) || null,
    orderCreatedAt: safeString(row.order_created_at) || null,
    soldAt: safeString(row.sold_at) || null,
    soldInvalidAt: safeString(row.sold_invalid_at) || null,
    lastCheckedAt: safeString(row.last_checked_at) || null,
    plan: safeString(row.plan) || null,
    credentialType: safeString(row.credential_type) || null,
    checkStatus: safeString(row.check_status) || null,
    checkConnected: typeof row.check_connected === "boolean" ? row.check_connected : null,
    checkMessage: safeString(row.check_message) || null,
    isInvalid: Boolean(row.is_invalid),
    observedSurvivalSeconds: numberOrNull(row.observed_survival_seconds),
    invalidSurvivalSeconds: numberOrNull(row.invalid_survival_seconds),
    observedCostPerHourCents: numberOrNull(row.observed_cost_per_hour_cents)
  };
}

function normalizePagination(raw: Record<string, unknown> | undefined, page: number, limit: number): PaginationInfo {
  const total = numberOrNull(raw?.total) ?? 0;
  const totalPages = numberOrNull(raw?.total_pages) ?? Math.max(1, Math.ceil(total / limit));
  return {
    page: numberOrNull(raw?.page) ?? page,
    limit: numberOrNull(raw?.limit) ?? limit,
    total,
    totalPages,
    hasPrev: Boolean(raw?.has_prev) || (numberOrNull(raw?.page) ?? page) > 1,
    hasNext: Boolean(raw?.has_next) || (numberOrNull(raw?.page) ?? page) < totalPages
  };
}

async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "invalid json body");
  }
}

function json(payload: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function html(document: string, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(document, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      ...extraHeaders
    }
  });
}

function redirect(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location: path
    }
  });
}

function handleError(request: Request, error: unknown): Response {
  const isApi = new URL(request.url).pathname.startsWith("/api/") || request.method !== "GET";
  if (error instanceof HttpError) {
    if (isApi) {
      return json({ error: error.message }, error.status);
    }
    return html(`<pre>${escapeHtml(error.message)}</pre>`, error.status);
  }
  const message = normalizeError(error);
  if (isApi) {
    return json({ error: message }, 500);
  }
  return html(`<pre>${escapeHtml(message)}</pre>`, 500);
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function parseJsonText<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }
  return Object.fromEntries(
    header
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const index = chunk.indexOf("=");
        if (index === -1) {
          return [chunk, ""];
        }
        return [chunk.slice(0, index), decodeURIComponent(chunk.slice(index + 1))];
      })
  );
}

function makeCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function createSignedCookie(env: Env, payload: SessionPayload): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const signature = await signBytes(env.SESSION_SECRET, data);
  return `${base64UrlEncode(data)}.${base64UrlEncode(signature)}`;
}

async function verifySignedCookie(env: Env, token: string): Promise<SessionPayload | null> {
  const [dataPart, signaturePart] = token.split(".");
  if (!dataPart || !signaturePart) {
    return null;
  }
  const data = base64UrlDecode(dataPart);
  const signature = base64UrlDecode(signaturePart);
  const expected = await signBytes(env.SESSION_SECRET, data);
  if (!timingSafeEqual(signature, expected)) {
    return null;
  }
  try {
    return JSON.parse(new TextDecoder().decode(data)) as SessionPayload;
  } catch {
    return null;
  }
}

async function signBytes(secret: string, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, toArrayBuffer(data));
  return new Uint8Array(signature);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "===".slice((normalized.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function summarizeHtml(htmlInput: unknown): string | null {
  const raw = safeString(htmlInput);
  if (!raw) {
    return null;
  }
  const plain = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain ? plain.slice(0, 180) : null;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function centsToYuan(cents: number): number {
  return Math.round(cents) / 100;
}

function inferStockState(stockExact: number | null, stockDisplay: string | null): "in_stock" | "sold_out" | "unknown" {
  if (stockExact !== null) {
    return stockExact > 0 ? "in_stock" : "sold_out";
  }
  const normalized = (stockDisplay ?? "").trim();
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

function absoluteUrl(baseUrl: string, path: string): string {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}

async function mapLimit<T, R>(
  input: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(input.length);
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;
      if (index >= input.length) {
        return;
      }
      results[index] = await mapper(input[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, input.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function svgFavicon(): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1b1a16"/><path d="M16 45V19h17.4c8.2 0 13 4.3 13 10.8 0 7.1-5.2 11.2-13.7 11.2H24v4H16Zm8-10h8.2c4.1 0 6.3-1.8 6.3-5.1 0-3.1-2.1-4.9-6.1-4.9H24v10Z" fill="#f5ecd9"/></svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml"
    }
  });
}
