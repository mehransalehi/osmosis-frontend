"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

type Contact = {
  id: number;
  name: string;
  userEmail: string;
  text: string;
  createdAt: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  async function fetchContacts(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/contacts?page=${p}`);
    const data = await res.json();
    setContacts(data.items);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    fetchContacts(page);
  }

  return (
    <>
      <Head>
        <title>Admin Contact | NNX</title>
      </Head>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Contact Messages</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.userEmail}</td>
                    <td title={c.text}>...</td>
                    <td>{new Date(c.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(c.id)}
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
      </div>
    </>
  );
}
