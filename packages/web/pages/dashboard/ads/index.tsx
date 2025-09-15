"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
type Ad = {
  id: number;
  title: string;
  description: string;
  link?: string;
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
        <title>Admin Ads | NNX</title>
      </Head>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Ads</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            New Ad
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Link</th>
                    <th>Image</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id}>
                      <td>{ad.title}</td>
                      <td title={ad.description}>...</td>
                      <td>{ad.link}</td>
                      <td>
                        {ad.imageUrl && (
                          <img src={ad.imageUrl} alt="" className="h-10 w-10" />
                        )}
                      </td>
                      <td>{new Date(ad.createdAt).toLocaleDateString()}</td>
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
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                {editingAd ? "Edit Ad" : "New Ad"}
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
                    imageUrl: formData.get("imageUrl") as string,
                  });
                }}
                className="flex flex-col gap-2 mt-2"
              >
                <input
                  name="title"
                  defaultValue={editingAd?.title || ""}
                  placeholder="Title"
                  className="input input-bordered"
                  required
                />
                <textarea
                  name="description"
                  defaultValue={editingAd?.description || ""}
                  placeholder="Description"
                  className="textarea textarea-bordered"
                  required
                />
                <input
                  name="link"
                  defaultValue={editingAd?.link || ""}
                  placeholder="Link"
                  className="input input-bordered"
                />
                <input
                  name="imageUrl"
                  defaultValue={editingAd?.imageUrl || ""}
                  placeholder="Image URL"
                  className="input input-bordered"
                />

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAd(null);
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
