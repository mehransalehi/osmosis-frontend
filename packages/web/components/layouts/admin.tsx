/* eslint-disable */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { useEffect, useState } from "react";
import { getLocale } from "~/utils/i18n";
import { AdminLanguageProvider } from "~/utils/admin-language-context";

interface Props {
  children: React.ReactNode;
}

export function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<string>("winter");
  const [lang, setLang] = useState<string>("en");
  const t = getLocale(lang);
  const links = [
    { text: t.menu.dashboard, href: "/dashboard", icon: "fa-solid fa-house" },
    { text: t.menu.ads, href: "/dashboard/ads", icon: "fa-solid fa-headset" },
    {
      text: t.menu.notif,
      href: "/dashboard/notif",
      icon: "fa-solid fa-bell",
    },
    {
      text: t.menu.contact,
      href: "/dashboard/contact",
      icon: "fa-solid fa-comments",
    },
    { text: t.menu.rpc, href: "/dashboard/rpc", icon: "fa-solid fa-link" },
    {
      text: t.menu.settings,
      href: "/dashboard/settings",
      icon: "fa-solid fa-cog",
    },
  ];
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "winter";
    setTheme(savedTheme);

    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
    document.documentElement.setAttribute("data-theme", savedTheme);
    // document.documentElement.setAttribute("dir", "rtl");
    // Add class when dashboard layout mounts
    document.body.classList.add("dashboard-body");

    // Clean up: remove class when leaving dashboard
    return () => {
      document.documentElement.setAttribute("data-theme", "synthwave");
      document.body.classList.remove("dashboard-body");
    };
  }, []);

  useEffect(() => {
    // if user not logged in, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "winter" ? "synthwave" : "winter"; // or custom DaisyUI themes
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  //Toggle Language
  const toggleLang = () => {
    const newLang = lang === "en" ? "ar" : "en"; // or custom DaisyUI themes
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <AdminLanguageProvider lang={lang} setLang={setLang}>
      <div
        className="min-h-screen flex flex-col bg-gray-50 admin-dashboard-nnx"
        dir={lang == "en" ? "" : "rtl"}
      >
        <div className="navbar bg-base-200">
          <div className="flex-1">
            <label
              htmlFor="my-drawer"
              className="btn btn-ghost drawer-button hidden lg:flex"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </label>
            <a className="btn btn-ghost normal-case text-xl" href="/">
              <img src="/images/logo.png" alt="logo" className="h-full" />
            </a>
          </div>
          <div className="flex-none">
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={toggleLang}
            >
              {lang === "en" ? "EN" : "AR"}
            </button>
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={toggleTheme}
            >
              {theme === "winter" ? "🌙" : "☀️"}
            </button>
            <div className="dropdown dropdown-end ml-4">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full border border-primary !flex justify-center items-center">
                  <i className="fa-solid fa-user"></i>
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <span className="justify-between">
                    {session?.user?.email}
                  </span>
                </li>
                <li>
                  <Link href="/dashboard/settings">{t.menu.settings}</Link>
                </li>
                <li>
                  <button
                    onClick={() =>
                      signOut({
                        callbackUrl: `${window.location.origin}/login`,
                      })
                    }
                  >
                    {t.menu.logout}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <main className="flex-1 flex flex-col">
          <div className="drawer h-full flex-1">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content grid grid-cols-12 h-full">
              <ul className="menu bg-base-200 col-span-2 lg:hidden h-full">
                {links.map((link) => {
                  return (
                    <li key={link.text}>
                      <Link
                        href={link.href}
                        className={pathname === link.href ? "active" : ""}
                      >
                        <i className={link.icon}></i>
                        {link.text}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() =>
                      signOut({
                        callbackUrl: `${window.location.origin}/login`,
                      })
                    }
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    {t.menu.logout}
                  </button>
                </li>
              </ul>
              <div className="col-span-10 lg:col-span-12 h-full p-6">
                {children}
              </div>
            </div>
            <div className="drawer-side w-full">
              <div className=" w-80 min-h-full bg-base-200 right-0 translate-x-full">
                <div
                  className={
                    lang == "en"
                      ? `w-full flex justify-between items-center py-4 pr-4`
                      : `w-full flex justify-between items-center py-4 pl-4`
                  }
                >
                  <a className="btn btn-ghost normal-case text-xl" href="/">
                    <img src="/images/logo.png" alt="logo" className="h-full" />
                  </a>
                  <label
                    htmlFor="my-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </label>
                </div>
                <ul className="menu p-4 w-full text-base-content">
                  {links.map((link) => {
                    return (
                      <li key={link.text}>
                        <Link
                          href={link.href}
                          className={pathname === link.href ? "active" : ""}
                        >
                          <i className={link.icon}></i>
                          {link.text}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      onClick={() =>
                        signOut({
                          callbackUrl: `${window.location.origin}/login`,
                        })
                      }
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                      {t.menu.logout}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
          <aside>
            <p>{t.crp}</p>
          </aside>
        </footer>
      </div>
    </AdminLanguageProvider>
  );
}
