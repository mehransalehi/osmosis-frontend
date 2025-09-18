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
      <div className="p-6 lg:p-0">
        <h1 className="text-xl font-bold mb-4">Contact Messages</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="md:hidden">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="md:flex md:flex-col md:w-full md:mb-5 md:text-lg sm:text-sm"
                  >
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Name :</span>
                      {c.name}
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Email :</span>
                      {c.userEmail}
                    </td>

                    <td title={c.text} className="md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Text :</span>
                      <span className="md:hidden block">...</span>
                      <span className="hidden md:block mt-4">{c.text}</span>
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">Date :</span>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
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
