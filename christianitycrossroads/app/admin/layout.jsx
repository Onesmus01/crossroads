"use client";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

/**
 * AdminLayout wraps all admin pages
 * Includes:
 *  - Sidebar navigation
 *  - Header/topbar
 *  - Main content area
 */

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header / Topbar */}
        <Header />

        {/* Page content */}
        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
