// duplicateUtils.ts — Helpers to detect duplicate / missing Asset IDs.
import { Asset } from "@/types/asset";

export const MISSING_PREFIX = "MISSING-";

export const normalizeAssetId = (id: string | number | null | undefined): string =>
  String(id ?? "").trim().toLowerCase();

export const isMissingAssetId = (id: string | number | null | undefined): boolean => {
  const s = String(id ?? "").trim();
  if (!s) return true;
  if (s.toUpperCase() === "N/A") return true;
  if (s.toUpperCase().startsWith(MISSING_PREFIX)) return true;
  return false;
};

/** Returns a Set of normalized Asset IDs that appear more than once (excludes missing IDs). */
export const getDuplicateAssetIdSet = (assets: Asset[]): Set<string> => {
  const counts = new Map<string, number>();
  for (const a of assets) {
    if (isMissingAssetId(a["Asset ID"])) continue;
    const key = normalizeAssetId(a["Asset ID"]);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const dupes = new Set<string>();
  counts.forEach((c, k) => { if (c > 1) dupes.add(k); });
  return dupes;
};

export const isDuplicateAsset = (asset: Asset, dupSet: Set<string>): boolean =>
  !isMissingAssetId(asset["Asset ID"]) && dupSet.has(normalizeAssetId(asset["Asset ID"]));
