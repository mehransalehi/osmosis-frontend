"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";
type Ad = {
  id: number;
  title: string;
  description: string;
  link?: string;
  twitter?: string;
  github?: string;
  imageUrl?: string;
  createdAt: string;
};

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  async function fetchAds(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/ads?page=${p}`);
    const data = await res.json();
    setAds(data.items);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchAds(page);
  }, [page]);

  async function handleSave(ad: Partial<Ad>) {
    if (editingAd) {
      await fetch(`/api/admin/ads/${editingAd.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ad),
      });
    } else {
      await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ad),
      });
    }
    setShowModal(false);
    setEditingAd(null);
    fetchAds(page);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    fetchAds(page);
  }

  return (
    <>
      <Head>
        <title>{t.titles.ads}</title>
      </Head>
      <div className="p-6 lg:p-0">
        <div className="flex md:flex-col justify-between mb-4 items-center md:items-start">
          <h1 className="text-xl font-bold">{t.menu.ads}</h1>
          <button
            className="btn btn-primary md:w-full"
            onClick={() => setShowModal(true)}
          >
            {t.ads.newads}
          </button>
        </div>

        {loading ? (
          <p>{t.loading}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="md:hidden text-center">
                    <th>{t.tables.ads.title}</th>
                    <th>{t.tables.ads.desc}</th>
                    <th>{t.tables.ads.link}</th>
                    <th>{t.tables.ads.twitter}</th>
                    <th>{t.tables.ads.github}</th>
                    <th>{t.tables.ads.image}</th>
                    <th>{t.tables.ads.date}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr
                      key={ad.id}
                      className="md:flex md:flex-col md:w-full md:mb-5 md:text-lg sm:text-sm text-center md:text-unset"
                    >
                      <td className="md:flex justify-between md:border-b border-base-200">
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.title} :
                        </span>
                        {ad.title}
                      </td>
                      <td
                        title={ad.description}
                        className="md:border-b border-base-200"
                      >
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.desc} :
                        </span>
                        <span className="md:hidden block">...</span>
                        <span className="hidden md:block mt-4">
                          {ad.description}
                        </span>
                      </td>
                      <td className="md:flex justify-between md:border-b border-base-200">
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.link} :
                        </span>
                        {ad.link}
                      </td>
                      <td className="md:flex justify-between md:border-b border-base-200">
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.twitter} :
                        </span>
                        {ad.twitter}
                      </td>
                      <td className="md:flex justify-between md:border-b border-base-200">
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.github} :
                        </span>
                        {ad.github}
                      </td>
                      <td>
                        {ad.imageUrl && (
                          <img src={ad.imageUrl} alt="" className="h-10 w-10" />
                        )}
                      </td>
                      <td className="md:flex justify-between md:border-b border-base-200">
                        <span className="hidden md:block font-bold">
                          {t.tables.ads.date} :
                        </span>
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </td>
                      <td className="flex gap-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingAd(ad);
                            setShowModal(true);
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t.pagination.prev}
              </button>
              <span>
                <span className="mx-2">{t.pagination.page}</span> {page} /{" "}
                {totalPages || 1}
              </span>
              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t.pagination.next}
              </button>
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                {editingAd ? t.ads.editads : t.ads.newads}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  handleSave({
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    link: formData.get("link") as string,
                    twitter: formData.get("twitter") as string,
                    github: formData.get("github") as string,
                    imageUrl: formData.get("imageUrl") as string,
                  });
                }}
                className="flex flex-col gap-2 mt-2"
              >
                <input
                  name="title"
                  defaultValue={editingAd?.title || ""}
                  placeholder={t.tables.ads.title}
                  className="input input-bordered caret-base-content"
                  required
                />
                <textarea
                  name="description"
                  defaultValue={editingAd?.description || ""}
                  placeholder={t.tables.ads.desc}
                  className="textarea textarea-bordered"
                  required
                />
                <input
                  name="link"
                  defaultValue={editingAd?.link || ""}
                  placeholder={t.tables.ads.link}
                  className="input input-bordered caret-base-content"
                />
                <input
                  name="imageUrl"
                  defaultValue={editingAd?.imageUrl || ""}
                  placeholder={t.tables.ads.image + " URL"}
                  className="input input-bordered caret-base-content"
                />
                <input
                  name="twitter"
                  defaultValue={editingAd?.twitter || ""}
                  placeholder={t.tables.ads.twitter}
                  className="input input-bordered caret-base-content"
                />
                <input
                  name="github"
                  defaultValue={editingAd?.github || ""}
                  placeholder={t.tables.ads.github}
                  className="input input-bordered caret-base-content"
                />

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary mx-2">
                    {t.save}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAd(null);
                    }}
                  >
                    {t.cancele}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
