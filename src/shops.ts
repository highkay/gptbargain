import type { FetchMode, SiteFamily } from "./types";

export interface BaseShopConfig {
  id: string;
  name: string;
  family: SiteFamily;
  baseUrl: string;
  fetchMode?: FetchMode;
}

export interface ShopApiConfig extends BaseShopConfig {
  family: "shopapi";
  token: string;
}

export interface AcgLikeConfig extends BaseShopConfig {
  family: "acg-like";
}

export interface NexusVaultConfig extends BaseShopConfig {
  family: "nexusvault";
  workspacePath: string;
}

export interface DujiaoNextConfig extends BaseShopConfig {
  family: "dujiao-next";
}

export interface AutopixelRscConfig extends BaseShopConfig {
  family: "autopixel-rsc";
}

export type ShopConfig = ShopApiConfig | AcgLikeConfig | NexusVaultConfig | DujiaoNextConfig | AutopixelRscConfig;

export const SHOPS: ShopConfig[] = [
  {
    id: "ldxp-chongapi",
    name: "ChongAPI-源头商家",
    family: "shopapi",
    baseUrl: "https://pay.ldxp.cn",
    token: "TSCE0SEH",
    fetchMode: "client"
  },
  {
    id: "ooeao-blackgoose",
    name: "黑鹅小铺",
    family: "shopapi",
    baseUrl: "https://www.ooeao.com",
    token: "ithte"
  },
  {
    id: "dimosky-ai-store",
    name: "AI 能量小店",
    family: "acg-like",
    baseUrl: "https://store.dimosky.com"
  },
  {
    id: "nexusvault-seller-candidates",
    name: "NexusVault 商家候选",
    family: "nexusvault",
    baseUrl: "https://trade.livetools.top",
    workspacePath: "/workspace/extract"
  }
];
