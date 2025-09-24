import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";

interface DashboardStats {
  contactCount: number;
  adsCount: number;
  notificationsCount: number;
  assetsCount: number;
  chainsCount: number;
  blacklistedAssetsCount: number;
}
export default function Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stat");
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-500">{t.loading}</p>;
  if (error)
    return (
      <p className="text-red-500">
        {t.error}: {error}
      </p>
    );
  if (!stats) return <p>{t.nodata}</p>;
  return (
    <>
      <Head>
        <title>{t.titles.dashboard}</title>
      </Head>
      <div className="w-full grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-4">
        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-comments text-3xl"></i>
          </div>
          <div className="stat-title">{t.dashboard.contactmsg}</div>
          <div className="stat-value">{stats.contactCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/contact"
          >
            {t.menu.contact}
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-headset text-3xl"></i>
          </div>
          <div className="stat-title">{t.menu.ads}</div>
          <div className="stat-value">{stats.adsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/ads"
          >
            {t.menu.ads}
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-bell text-3xl"></i>
          </div>
          <div className="stat-title">{t.menu.notif}</div>
          <div className="stat-value">{stats.notificationsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/notif"
          >
            {t.menu.notif}
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-coins text-3xl"></i>
          </div>
          <div className="stat-title">{t.assets}</div>
          <div className="stat-value">{stats.assetsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/rpc"
          >
            {t.menu.rpc}
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-link text-3xl"></i>
          </div>
          <div className="stat-title">{t.chains}</div>
          <div className="stat-value">{stats.chainsCount}</div>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-list-check text-3xl"></i>
          </div>
          <div className="stat-title">{t.dashboard.blacklistedassets}</div>
          <div className="stat-value">{stats.blacklistedAssetsCount}</div>
        </div>
      </div>
    </>
  );
}
