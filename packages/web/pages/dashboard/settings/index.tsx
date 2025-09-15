"use client";
import Head from "next/head";
import { useState } from "react";
export default function AdminSettingsPage() {
  const [tab, setTab] = useState("account");

  return (
    <>
      <Head>
        <title>Admin Settings | NNX</title>
      </Head>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Admin Settings</h1>

        {/* Tabs */}
        <div className="tabs">
          <a
            className={`tab tab-bordered ${
              tab === "account" ? "tab-active" : ""
            }`}
            onClick={() => setTab("account")}
          >
            Change Password
          </a>
          <a
            className={`tab tab-bordered ${tab === "site" ? "tab-active" : ""}`}
            onClick={() => setTab("site")}
          >
            Site Settings
          </a>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {tab === "account" && <AccountSettings />}
          {tab === "site" && <SiteSettings />}
        </div>
      </div>
    </>
  );
}

function AccountSettings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/settings/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage("Account updated successfully.");
      setEmail("");
      setPassword("");
    } else {
      const data = await res.json();
      setMessage(data.error || "Update failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
      {message && <div className="alert">{message}</div>}

      <input
        type="email"
        placeholder="New Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input input-bordered"
        required
      />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input input-bordered"
        required
      />

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Updating..." : "Update Account"}
      </button>
    </form>
  );
}

function SiteSettings() {
  return (
    <div>
      <p className="text-gray-500">Site settings will be added here later.</p>
    </div>
  );
}
