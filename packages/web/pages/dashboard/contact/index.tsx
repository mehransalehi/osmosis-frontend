"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

import { useAdminLanguage } from "~/utils/admin-language-context";
import { getLocale } from "~/utils/i18n";

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
  const { lang } = useAdminLanguage();
  const t = getLocale(lang);

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
        <title>{t.titles.contact}</title>
      </Head>
      <div className="p-6 lg:p-0">
        <h1 className="text-xl font-bold mb-4">{t.contact.contactmsg}</h1>

        {loading ? (
          <p>{t.loading}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="md:hidden text-center">
                  <th>{t.tables.contact.name}</th>
                  <th>{t.tables.contact.email}</th>
                  <th>{t.tables.contact.msg}</th>
                  <th>{t.tables.contact.date}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="md:flex md:flex-col md:w-full md:mb-5 md:text-lg sm:text-sm text-center"
                  >
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.contact.name} :
                      </span>
                      {c.name}
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.contact.email} :
                      </span>
                      {c.userEmail}
                    </td>

                    <td title={c.text} className="md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.contact.msg} :
                      </span>
                      <span className="md:hidden block">...</span>
                      <span className="hidden md:block mt-4">{c.text}</span>
                    </td>
                    <td className="md:flex justify-between md:border-b border-base-200">
                      <span className="hidden md:block font-bold">
                        {t.tables.contact.date} :
                      </span>
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
      </div>
    </>
  );
}
