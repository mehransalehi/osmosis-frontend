import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!stats) return <p>No data available</p>;
  return (
    <>
      <Head>
        <title>Admin Dashboard | NNX</title>
      </Head>
      <div className="w-full grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-4">
        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-comments text-3xl"></i>
          </div>
          <div className="stat-title">Contact Messages</div>
          <div className="stat-value">{stats.contactCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/contact"
          >
            Contacts
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-headset text-3xl"></i>
          </div>
          <div className="stat-title">Ads</div>
          <div className="stat-value">{stats.adsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/ads"
          >
            Ads
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-bell text-3xl"></i>
          </div>
          <div className="stat-title">Notifications</div>
          <div className="stat-value">{stats.notificationsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/notif"
          >
            Notifications
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-coins text-3xl"></i>
          </div>
          <div className="stat-title">Assets</div>
          <div className="stat-value">{stats.assetsCount}</div>
          <Link
            className="stat-desc mt-3 text-primary underline"
            href="/dashboard/rpc"
          >
            RPC Managment
          </Link>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-link text-3xl"></i>
          </div>
          <div className="stat-title">Chains</div>
          <div className="stat-value">{stats.chainsCount}</div>
        </div>

        <div className="stat shadow rounded-lg">
          <div className="stat-figure text-secondary">
            <i className="fa-solid fa-list-check text-3xl"></i>
          </div>
          <div className="stat-title">Blacklisted Assets</div>
          <div className="stat-value">{stats.blacklistedAssetsCount}</div>
        </div>
      </div>
    </>
  );
}
