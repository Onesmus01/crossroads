"use client";

import Link from "next/link";
import { FaBook, FaHome, FaPlus } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="text-2xl font-bold p-6 border-b border-gray-700">
        Admin Panel
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/admin"
          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
        >
          <FaHome /> Dashboard
        </Link>

        <Link
          href="/admin/books"
          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
        >
          <FaBook /> Books
        </Link>

        <Link
          href="/admin/books/add"
          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
        >
          <FaPlus /> Add Book
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
