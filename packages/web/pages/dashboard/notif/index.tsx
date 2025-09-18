"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
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
        <title>Admin Notifications | NNX</title>
      </Head>
      <div className="p-6 lg:p-0">
        <div className="flex md:flex-col justify-between mb-4 items-center md:items-start">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button
            className="btn btn-primary md:w-full"
            onClick={() => setShowModal(true)}
          >
            New Notification
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="md:hidden">
                  <th>Title</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr
                    key={n.id}
                    className="md:flex md:flex-col md:w-full md:mb-5 md:text-lg sm:text-sm"
                  >
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Title :</span>
                      {n.title}
                    </td>
                    <td
                      title={n.description}
                      className="md:border-b border-base-200"
                    >
                      <span className="hidden md:block font-bold">
                        Description :
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
                        {n.type}
                      </span>
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Date :</span>
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
            Prev
          </button>
          <span>
            Page {page} / {totalPages || 1}
          </span>
          <button
            className="btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                {editingItem ? "Edit Notification" : "New Notification"}
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
                  placeholder="Title"
                  className="input input-bordered"
                  required
                />
                <textarea
                  name="description"
                  defaultValue={editingItem?.description || ""}
                  placeholder="Description"
                  className="textarea textarea-bordered"
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
                  <option value="ERROR">Error</option>
                </select>

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
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
