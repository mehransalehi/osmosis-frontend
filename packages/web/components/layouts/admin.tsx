import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  children: React.ReactNode;
}
const links = [
  { text: "Home", href: "/dashboard", icon: "fa-regular fa-house" },
  { text: "Ads", href: "/dashboard/ads", icon: "fa-solid fa-headset" },
  { text: "Notification", href: "/dashboard/notif", icon: "fa-solid fa-bell" },
  { text: "Contact", href: "/dashboard/contact", icon: "fa-solid fa-comments" },
  { text: "RPC Managment", href: "/dashboard/rpc", icon: "fa-solid fa-link" },
  { text: "Settings", href: "/dashboard/settings", icon: "fa-solid fa-cog" },
];
export function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">daisyUI</a>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <main className="flex-1 flex flex-col">
          <div className="drawer h-full flex-1">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content grid grid-cols-12 h-full">
              <ul className="menu bg-base-200 col-span-2 h-full">
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
                  <a>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Logout
                  </a>
                </li>
              </ul>
              <div className="col-span-10 h-full p-6">{children}</div>
              {/* <label
                htmlFor="my-drawer"
                className="btn btn-primary drawer-button"
              >
                Open drawer
              </label> */}
            </div>
            <div className="drawer-side">
              <label
                htmlFor="my-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <li>
                  <a>Sidebar Item 1</a>
                </li>
                <li>
                  <a>Sidebar Item 2</a>
                </li>
              </ul>
            </div>
          </div>
        </main>
        <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
          <aside>
            <p>Copyright © 2025 - All right reserved by NNX</p>
          </aside>
        </footer>
      </div>
    </>
  );
}
