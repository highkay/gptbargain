export type SiteFamily = "shopapi" | "acg-like" | "nexusvault" | "dujiao-next" | "autopixel-rsc";
export type FetchMode = "worker" | "client";

export interface CatalogItem {
  id: string;
  siteId: string;
  siteName: string;
  family: SiteFamily;
  externalId: string | null;
  title: string;
  category: string;
  price: number | null;
  marketPrice: number | null;
  stockExact: number | null;
  stockDisplay: string | null;
  stockState: "in_stock" | "sold_out" | "unknown";
  soldCount: number | null;
  minOrderQuantity: number | null;
  imageUrl: string | null;
  description: string | null;
  sourceUrl: string;
  detailPath: string | null;
  updatedAt: string;
}

export interface ShopSummary {
  id: string;
  name: string;
  family: SiteFamily;
  fetchMode: FetchMode;
  sourceUrl: string;
  updatedAt: string;
  itemCount: number;
}

export interface ClientSourceSummary {
  siteId: string;
  siteName: string;
  family: "shopapi";
  fetchMode: "client";
  baseUrl: string;
  sourceUrl: string;
  token: string;
  note: string | null;
}

export interface ShopSnapshot {
  siteId: string;
  siteName: string;
  family: SiteFamily;
  sourceUrl: string;
  updatedAt: string;
  itemCount: number;
  items: CatalogItem[];
}

export interface CatalogPayload {
  version: string;
  generatedAt: string;
  siteCount: number;
  itemCount: number;
  shops: ShopSummary[];
  clientSources: ClientSourceSummary[];
  items: CatalogItem[];
}

export interface RefreshSiteResult {
  siteId: string;
  siteName: string;
  family: SiteFamily;
  fetchMode: FetchMode;
  ok: boolean;
  stale: boolean;
  itemCount: number;
  updatedAt: string | null;
  error: string | null;
}

export interface RefreshStatus {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  okCount: number;
  failCount: number;
  itemCount: number;
  siteResults: RefreshSiteResult[];
}

export interface PlatformConfigSummary {
  siteId: string;
  siteName: string;
  family: SiteFamily;
  configured: boolean;
  source: "kv" | "env" | "none";
  updatedAt: string | null;
  preview: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface NexusVaultSellerDetailRow {
  orderId: string;
  orderRef: string;
  cardId: string | null;
  cardRef: string | null;
  orderCreatedAt: string | null;
  soldAt: string | null;
  soldInvalidAt: string | null;
  lastCheckedAt: string | null;
  plan: string | null;
  credentialType: string | null;
  checkStatus: string | null;
  checkConnected: boolean | null;
  checkMessage: string | null;
  isInvalid: boolean;
  observedSurvivalSeconds: number | null;
  invalidSurvivalSeconds: number | null;
  observedCostPerHourCents: number | null;
}

export interface NexusVaultDetailPayload {
  item: CatalogItem;
  merchantId: string;
  startDate: string | null;
  startAt: string | null;
  updatedAt: string | null;
  rows: NexusVaultSellerDetailRow[];
  pagination: PaginationInfo;
}

export interface CredentialRecord {
  note: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}
