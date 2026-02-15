"use client";

import { useEffect, useState } from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import ChangeUserRole from "@/components/admin/ChangeUserRole.jsx";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

// Avatar color generator
const getAvatarColor = (letter) => {
  if (!letter) return "bg-slate-600";
  const colors = [
    "bg-red-500","bg-orange-500","bg-amber-500","bg-yellow-500",
    "bg-green-500","bg-emerald-500","bg-teal-500","bg-cyan-500",
    "bg-sky-500","bg-blue-500","bg-indigo-500","bg-violet-500",
    "bg-purple-500","bg-fuchsia-500","bg-pink-500","bg-rose-500"
  ];
  return colors[letter.toUpperCase().charCodeAt(0) % colors.length];
};

export default function AllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from backend
  const getAllUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/user/all-users`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log("API response:", data); // <-- debug log
      if (res.ok) {
        setAllUsers(data.data || []); // <-- fix field name here
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Update user role
  const updateUserData = async (id, newRole) => {
    try {
      const res = await fetch(`${backendUrl}/user/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  const handleOpenModal = (userData) => setSelectedUser(userData);

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-slate-800">Users</h2>
          <span className="text-sm text-slate-500">Total: {allUsers?.length || 0}</span>
        </div>

        {/* Desktop/Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allUsers?.length ? (
                allUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold ${getAvatarColor(u?.name?.charAt(0))}`}>
                        {u?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{u?.name}</p>
                        <p className="text-xs text-slate-500">ID: {u?._id?.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u?.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {u?.role || "general"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(u?.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600" title="View">
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-600"
                          title="Change Role"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y">
          {allUsers?.map((u) => (
            <div key={u._id} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold ${getAvatarColor(u?.name?.charAt(0))}`}>
                  {u?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{u?.name}</p>
                  <p className="text-xs text-slate-500">{u?.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">{u?.role || "general"}</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Active</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">{new Date(u?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <FiEye className="text-indigo-600 cursor-pointer" size={18} />
                <FiEdit onClick={() => handleOpenModal(u)} className="text-amber-600 cursor-pointer" size={18} />
                <FiTrash2 className="text-red-600 cursor-pointer" size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Role Modal */}
      {selectedUser && (
        <ChangeUserRole
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={updateUserData}
        />
      )}
    </div>
  );
}
