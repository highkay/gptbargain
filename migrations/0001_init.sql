CREATE TABLE IF NOT EXISTS app_state (
  state_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  base_url TEXT NOT NULL,
  fetch_mode TEXT NOT NULL,
  token TEXT,
  workspace_path TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS shop_snapshots (
  site_id TEXT PRIMARY KEY,
  site_name TEXT NOT NULL,
  family TEXT NOT NULL,
  source_url TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  item_count INTEGER NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_configs_enabled ON shop_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_shop_snapshots_updated_at ON shop_snapshots(updated_at);
