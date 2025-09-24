/* eslint-disable */
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";

interface Asset {
  id: number;
  chainName: string;
  assetName: string;
  logoPng?: string;
  isBlackList: boolean;
}

export default function AssetsAdmin() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showBlacklisted, setShowBlacklisted] = useState(false);
  const limit = 10;
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  const fetchAssets = useCallback(async () => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      blacklisted: showBlacklisted.toString(),
    }).toString();

    const res = await fetch(`/api/admin/rcp/assets?${query}`);
    const data = await res.json();
    setAssets(data.data);
    setTotal(data.total);
  }, [page, search, showBlacklisted]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const toggleAsset = async (id: number, isBlackList: boolean) => {
    await fetch("/api/admin/rcp/assets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isBlackList }),
    });
    fetchAssets();
  };

  const toggleGroup = async (chainName: string, isBlackList: boolean) => {
    await fetch("/api/admin/rcp/assets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chainNameToggle: chainName, isBlackList }),
    });
    fetchAssets();
  };

  const groupedAssets = assets.reduce((acc: Record<string, Asset[]>, asset) => {
    if (!acc[asset.chainName]) acc[asset.chainName] = [];
    acc[asset.chainName].push(asset);
    return acc;
  }, {});

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Head>
        <title>{t.titles.rpc}</title>
      </Head>
      <div className="p-4 lg:p-0">
        <div className="flex justify-between items-center mb-4 lg:flex-col lg:items-start">
          <h1 className="text-xl font-bold mb-4 flex-1">{t.rpc.assetslist}</h1>
          <div className="lg:flex lg:justify-between lg:w-full md:flex-col">
            <button
              className={`btn btn-primary  mx-6 ${
                showBlacklisted ? "active" : ""
              }`}
              onClick={() => {
                setShowBlacklisted((prev) => !prev);
                setPage(1);
              }}
            >
              {showBlacklisted ? t.rpc.showall : t.rpc.showblacklisted}
            </button>

            <div className="join md:ml-0 md:mt-4 overflow-hidden">
              <input
                className="input input-bordered join-item md:flex-1 caret-base-content"
                placeholder={t.rpc.searchtitle}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
              />
              <button
                className="btn btn-secondary join-item"
                onClick={() => {
                  setSearch(searchInput);
                  setPage(1);
                }}
              >
                {t.rpc.search}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4">
          {Object.keys(groupedAssets).map((chain) => (
            <div key={chain} className="mb-6 border border-base-300">
              <div className="flex justify-between items-center p-2 bg-gray-100 font-semibold">
                <span>{chain}</span>
                <label className="flex items-center space-x-2">
                  <span className="mx-2">{t.tables.rpc.blacklistgroup}</span>
                  <input
                    type="checkbox"
                    checked={groupedAssets[chain].every((a) => a.isBlackList)}
                    onChange={(e) => toggleGroup(chain, e.target.checked)}
                  />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>{t.tables.rpc.logo}</th>
                      <th className="text-left">{t.tables.rpc.assetname}</th>
                      <th>{t.tables.rpc.blacklist}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAssets[chain].map((asset) => (
                      <tr key={asset.id}>
                        <td className="w-[60px]">
                          {asset.logoPng ? (
                            <img
                              src={asset.logoPng}
                              className="w-6 h-6"
                              alt={asset.assetName}
                            />
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="w-1/4">{asset.assetName}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={asset.isBlackList}
                            onChange={(e) =>
                              toggleAsset(asset.id, e.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 justify-center mt-4">
          <button
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => p - 1)}
          >
            {t.pagination.prev}
          </button>
          <span className="px-3 py-1">
            <span className="mx-2">{t.pagination.page}</span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
          >
            {t.pagination.next}
          </button>
        </div>
      </div>
    </>
  );
}
