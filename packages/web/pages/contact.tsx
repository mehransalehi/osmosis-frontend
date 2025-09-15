"use client";
import Head from "next/head";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      userEmail: formData.get("userEmail"),
      text: formData.get("text"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess("Message sent successfully!");
      form.reset();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
  }

  return (
    <>
      <Head>
        <title>Contact | NNX</title>
      </Head>
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Contact Us</h1>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Your Name</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Your Email</span>
            </label>
            <input
              type="email"
              name="userEmail"
              placeholder="Your Email"
              className="input input-bordered w-full"
              required
            />
          </div>
          <textarea
            name="text"
            placeholder="Your Message"
            className="textarea textarea-bordered"
            rows={4}
            required
          ></textarea>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </>
  );
}
