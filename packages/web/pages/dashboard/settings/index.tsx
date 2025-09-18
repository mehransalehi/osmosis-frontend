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
        <div className="tabs w-full border-b border-base-200">
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
          {tab === "site" && <UploadLogoPage />}
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

function UploadLogoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 4 * 1024 * 1024) {
        setMessage("❌ File size must be less than 4 MB");
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a PNG file under 4 MB");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Logo updated successfully!");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Upload failed");
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg">Upload New Logo</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          className="file-input file-input-bordered file-input-success w-full"
          accept="image/png"
          onChange={handleFileChange}
        />

        {preview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Preview:</p>
            <img src={preview} alt="Preview" className="h-20 mt-1" />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full mt-2">
          Upload
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">Current Logo:</p>
        <img
          src="/images/logo.png"
          alt="Current Logo"
          className="h-20 mx-auto mt-1"
        />
      </div>
    </div>
  );
}
