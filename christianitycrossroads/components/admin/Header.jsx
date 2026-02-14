"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaEnvelope,
  FaChevronDown,
  FaSignOutAlt,
  FaUserShield,
  FaUserEdit,
} from "react-icons/fa";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Example admin user (replace with session / API)
  const admin = {
    name: "John Admin",
    role: "Super Admin", // "Super Admin" | "Admin" | "Editor"
    notifications: 5,
    messages: 2,
  };

  const roleColors = {
    "Super Admin": "bg-purple-600",
    Admin: "bg-blue-600",
    Editor: "bg-green-600",
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b relative">

      {/* LEFT */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back, {admin.name}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 relative">

        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-purple-600 transition">
          <FaBell className="text-lg" />
          {admin.notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {admin.notifications}
            </span>
          )}
        </button>

        {/* Messages */}
        <button className="relative text-gray-600 hover:text-blue-600 transition">
          <FaEnvelope className="text-lg" />
          {admin.messages > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 rounded-full">
              {admin.messages}
            </span>
          )}
        </button>

        {/* Profile */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold">
            {admin.name.charAt(0)}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {admin.name}
            </p>

            <span
              className={`text-xs text-white px-2 py-0.5 rounded-full ${roleColors[admin.role]}`}
            >
              {admin.role}
            </span>
          </div>

          <FaChevronDown className="text-gray-500 text-xs" />
        </div>

        {/* DROPDOWN */}
        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-14 bg-white shadow-xl rounded-xl w-56 py-2 border z-50"
          >
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
              Profile Settings
            </button>

            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
              Account Settings
            </button>

            {/* Role-Based Options */}
            {admin.role === "Super Admin" && (
              <button className="w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-600 text-sm flex items-center gap-2">
                <FaUserShield />
                Manage All Admins
              </button>
            )}

            {(admin.role === "Super Admin" || admin.role === "Admin") && (
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 text-sm flex items-center gap-2">
                <FaUserEdit />
                Manage Users
              </button>
            )}

            <hr className="my-2" />

            <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
