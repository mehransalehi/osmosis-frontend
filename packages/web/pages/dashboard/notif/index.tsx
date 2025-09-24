"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";
type Notification = {
  id: number;
  title: string;
  description: string;
  type: "ERROR" | "WARN" | "SUCCESS";
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

  async function fetchItems(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/notifications?page=${p}`);
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  async function handleSave(item: Partial<Notification>) {
    if (editingItem) {
      await fetch(`/api/admin/notifications/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } else {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    setShowModal(false);
    setEditingItem(null);
    fetchItems(page);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
    fetchItems(page);
  }

  return (
    <>
      <Head>
        <title>{t.titles.notif}</title>
      </Head>
      <div className="p-6 lg:p-0">
        <div className="flex md:flex-col justify-between mb-4 items-center md:items-start">
          <h1 className="text-xl font-bold">{t.menu.notif}</h1>
          <button
            className="btn btn-primary md:w-full"
            onClick={() => setShowModal(true)}
          >
            {t.notif.newnotif}
          </button>
        </div>

        {loading ? (
          <p>{t.loading}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="md:hidden text-center">
                  <th>{t.tables.notif.title}</th>
                  <th>{t.tables.notif.desc}</th>
                  <th>{t.tables.notif.type}</th>
                  <th>{t.tables.notif.date}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr
                    key={n.id}
                    className="md:flex md:flex-col md:w-full md:mb-5 md:text-lg sm:text-sm text-center"
                  >
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.notif.title} :
                      </span>
                      {n.title}
                    </td>
                    <td
                      title={n.description}
                      className="md:border-b border-base-200"
                    >
                      <span className="hidden md:block font-bold">
                        {t.tables.notif.desc} :
                      </span>
                      <span className="md:hidden block">...</span>
                      <span className="hidden md:block mt-4">
                        {n.description}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          n.type === "ERROR"
                            ? "badge-error"
                            : n.type === "WARN"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {n.type == "ERROR" ? "CRITICAL" : n.type}
                      </span>
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.notif.date} :
                      </span>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setEditingItem(n);
                          setShowModal(true);
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(n.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

        {/* Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                {editingItem ? t.notif.editnotif : t.notif.newnotif}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  handleSave({
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    type: formData.get("type") as "ERROR" | "WARN" | "SUCCESS",
                  });
                }}
                className="flex flex-col gap-2 mt-2"
              >
                <input
                  name="title"
                  defaultValue={editingItem?.title || ""}
                  placeholder={t.tables.notif.title}
                  className="input input-bordered caret-base-content"
                  required
                />
                <textarea
                  name="description"
                  defaultValue={editingItem?.description || ""}
                  placeholder={t.tables.notif.desc}
                  className="textarea textarea-bordered caret-base-content"
                  required
                />
                <select
                  name="type"
                  defaultValue={editingItem?.type || "SUCCESS"}
                  className="select select-bordered"
                  required
                >
                  <option value="SUCCESS">Success</option>
                  <option value="WARN">Warning</option>
                  <option value="ERROR">Critical</option>
                </select>

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary mx-2">
                    {t.save}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
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
