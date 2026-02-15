"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ROLE from "@/common/role.js"; // Make sure this path is correct

const ChangeUserRole = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState("");

  if (!user) return null;

  useEffect(() => {
    setRole(user.role || "general"); // default role
  }, [user]);

  const handleSave = () => {
    if (!role) return;
    onSave(user._id, role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <FiX size={18} />
        </button>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Change User Role
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Update permissions for this user
        </p>

        {/* User Info */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="text-sm text-slate-500">Name</p>
          <p className="font-semibold text-slate-800">{user.name}</p>

          <p className="text-sm text-slate-500 mt-3">Email</p>
          <p className="font-medium text-slate-700">{user.email}</p>
        </div>

        {/* Role Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Select Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(ROLE).map((el) => (
              <option value={el} key={el}>
                {el}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeUserRole;
