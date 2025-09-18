import { createInnerTRPCContext } from "@osmosis-labs/trpc";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";

let cachedBlacklist: string[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 10_000; // 30s - tweak as needed

async function fetchBlacklistFromNodeAPI() {
  // Determine origin - set NEXT_PUBLIC_BASE_URL in env for production (recommended)
  console.log(process.env.NEXT_PUBLIC_BASE_URL);
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  try {
    const res = await fetch(`${origin}/api/blacklist`);
    if (!res.ok) {
      console.error("fetchBlacklistFromNodeAPI bad status:", res.status);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as string[];
  } catch (err) {
    console.error("fetchBlacklistFromNodeAPI error:", err);
    return [];
  }
}

/** tRPC context for Next.js endpoints. */
export const createNextTrpcContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({
    assetLists: AssetLists,
    chainList: ChainList,
  });
};

export const createEdgeTrpcContext = async (
  _opts: FetchCreateContextFnOptions
) => {
  // use cache
  const now = Date.now();
  if (!cachedBlacklist || now > cacheExpiry) {
    cachedBlacklist = await fetchBlacklistFromNodeAPI();
    cacheExpiry = Date.now() + CACHE_TTL_MS;
  }

  const blacklist = cachedBlacklist ?? [];

  const filtered = AssetLists.map((chain) => ({
    ...chain,
    assets: chain.assets.filter(
      (asset) => !blacklist.includes(asset.coinMinimalDenom)
    ),
  }));

  return createInnerTRPCContext({
    assetLists: filtered,
    chainList: ChainList,
  });
};
