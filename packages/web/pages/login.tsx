/* eslint-disable import/no-extraneous-dependencies */
"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { status } = useSession();
  // ✅ Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false, // we handle redirection manually
        email,
        password,
      });

      if (!res || res.error) {
        setError(res?.error || "Login failed");
        setLoading(false);
      } else {
        // Successful login
        router.push("/dashboard"); // redirect to your admin dashboard
      }
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login</title>
      </Head>
      <div className="flex h-screen w-full justify-center items-start mt-10">
        <form
          onSubmit={handleLogin}
          className="flex flex-col justify-start items-center h-auto p-6"
        >
          <h1 className="text-lg mb-4">Login Admin</h1>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="text"
              placeholder="Email"
              className="input input-bordered w-full max-w-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full max-w-xs mt-4">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full max-w-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}
