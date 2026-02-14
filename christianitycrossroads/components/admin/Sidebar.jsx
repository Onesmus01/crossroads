"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBook,
  FaHome,
  FaPlus,
  FaUsers,
  FaMoneyBillWave,
  FaEnvelope,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();

  const linkStyle = (path) =>
    `flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
      pathname === path
        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
        : "hover:bg-gray-800 text-gray-300"
    }`;

  return (
    <aside className="w-72 bg-gray-950 text-white flex flex-col min-h-screen shadow-2xl border-r border-gray-800">
      
      {/* Header */}
      <div className="text-2xl font-bold p-6 border-b border-gray-800 bg-gradient-to-r from-purple-700 to-blue-700 text-white">
        🚀 Admin Boss
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <Link href="/admin" className={linkStyle("/admin")}>
          <span className="flex items-center gap-3">
            <FaHome /> Dashboard
          </span>
        </Link>

        <Link href="/admin/books" className={linkStyle("/admin/books")}>
          <span className="flex items-center gap-3">
            <FaBook /> Books
          </span>
        </Link>

        <Link href="/admin/books/add" className={linkStyle("/admin/books/add")}>
          <span className="flex items-center gap-3">
            <FaPlus /> Add Book
          </span>
        </Link>

        {/* Users */}
        <Link href="/admin/users" className={linkStyle("/admin/users")}>
          <span className="flex items-center gap-3">
            <FaUsers /> Users
          </span>
        </Link>

        {/* Payments */}
        <Link href="/admin/payments" className={linkStyle("/admin/payments")}>
          <span className="flex items-center gap-3">
            <FaMoneyBillWave /> Payments
          </span>
        </Link>

        {/* Emails */}
        <Link href="/admin/emails" className={linkStyle("/admin/emails")}>
          <span className="flex items-center gap-3">
            <FaEnvelope /> Emails
          </span>
          <span className="bg-red-500 text-xs px-2 py-1 rounded-full">
            5
          </span>
        </Link>

        {/* Notifications */}
        <Link href="/admin/notifications" className={linkStyle("/admin/notifications")}>
          <span className="flex items-center gap-3">
            <FaBell /> Notifications
          </span>
        </Link>

        {/* Analytics */}
        <Link href="/admin/analytics" className={linkStyle("/admin/analytics")}>
          <span className="flex items-center gap-3">
            <FaChartBar /> Analytics
          </span>
        </Link>

        {/* Settings */}
        <Link href="/admin/settings" className={linkStyle("/admin/settings")}>
          <span className="flex items-center gap-3">
            <FaCog /> Settings
          </span>
        </Link>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-lg transition-all duration-200 shadow-md">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
