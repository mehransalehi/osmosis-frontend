"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";
export default function AdminSettingsPage() {
  const [tab, setTab] = useState("account");
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  return (
    <>
      <Head>
        <title>{t.titles.settings}</title>
      </Head>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">{t.settings.title}</h1>

        {/* Tabs */}
        <div className="tabs w-full border-b border-base-200">
          <a
            className={`tab tab-bordered ${
              tab === "account" ? "tab-active" : ""
            }`}
            onClick={() => setTab("account")}
          >
            {t.settings.changepassword}
          </a>
          <a
            className={`tab tab-bordered ${tab === "site" ? "tab-active" : ""}`}
            onClick={() => setTab("site")}
          >
            {t.settings.sitesettings}
          </a>
          <a
            className={`tab tab-bordered ${
              tab === "herocard" ? "tab-active" : ""
            }`}
            onClick={() => setTab("herocard")}
          >
            {t.settings.editmainapp}
          </a>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {tab === "account" && <AccountSettings />}
          {tab === "site" && <UploadLogoPage />}
          {tab === "herocard" && <HeroCardSettings />}
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
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

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
      setMessage(t.settings.successupdate);
      setEmail("");
      setPassword("");
    } else {
      const data = await res.json();
      setMessage(data.error || t.settings.faildupdate);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
      {message && <div className="alert">{message}</div>}

      <input
        type="email"
        placeholder={t.settings.neweamil}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input input-bordered caret-base-content"
        required
      />

      <input
        type="password"
        placeholder={t.settings.newpassword}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input input-bordered caret-base-content"
        required
      />

      <button className="btn btn-primary" disabled={loading}>
        {loading ? t.settings.updating : t.settings.updateaccount}
      </button>
    </form>
  );
}

function UploadLogoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 4 * 1024 * 1024) {
        setMessage(t.settings.filesize);
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
    if (!file) return setMessage(t.settings.png);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(t.settings.successlogo);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(t.settings.faildlogo);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg">{t.settings.logotitle}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          className="file-input file-input-bordered file-input-success w-full"
          accept="image/png"
          onChange={handleFileChange}
        />

        {preview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">{t.settings.preview}:</p>
            <img src={preview} alt="Preview" className="h-20 mt-1" />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full mt-2">
          {t.settings.upload}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">{t.settings.currentlogo}:</p>
        <img
          src="/images/logo.png"
          alt="Current Logo"
          className="h-20 mx-auto mt-1"
        />
      </div>
    </div>
  );
}
function HeroCardSettings() {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    github: "",
    twitter: "",
    external: "",
    medium: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  // Fetch existing data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/settings/herocard");
        if (res.ok) {
          const data = await res.json();
          if (data?.value) {
            setForm(JSON.parse(data.value));
          }
        }
      } catch (err) {
        console.error("Failed to load herocard", err);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/admin/settings/herocard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setMessage(t.settings.successupdate);
    } else {
      const data = await res.json();
      setMessage(data.error || t.settings.faildupdate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4 mt-6">
      {message && <div className="alert">{message}</div>}

      <input
        name="title"
        type="text"
        placeholder={t.settings.mainapptitle}
        value={form.title}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="subtitle"
        type="text"
        placeholder={t.settings.mainappsubtitle}
        value={form.subtitle}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="imageUrl"
        type="text"
        placeholder={t.settings.mainappimgurl}
        value={form.imageUrl}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="github"
        type="text"
        placeholder={t.settings.mainappgiturl}
        value={form.github}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="twitter"
        type="text"
        placeholder={t.settings.mainapptwitterurl}
        value={form.twitter}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="external"
        type="text"
        placeholder={t.settings.mainappexternalurl}
        value={form.external}
        onChange={handleChange}
        className="input input-bordered"
      />
      <input
        name="medium"
        type="text"
        placeholder={t.settings.mainappmediumurl}
        value={form.medium}
        onChange={handleChange}
        className="input input-bordered"
      />

      <button className="btn btn-primary" disabled={loading}>
        {loading ? t.settings.updating : t.settings.save}
      </button>
    </form>
  );
}
