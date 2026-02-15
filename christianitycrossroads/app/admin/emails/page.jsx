"use client";

import { useState, useEffect } from "react";

let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function EmailsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${backendUrl}/user/all-users`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setUsers(data.users || []);
        } else {
          alert("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error fetching users");
      }
      setLoading(false);
    };

    fetchEmails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">User Emails</h1>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">#</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
