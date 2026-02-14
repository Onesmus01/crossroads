"use client";

import {
  FaUsers,
  FaBook,
  FaMoneyBillWave,
  FaEnvelope,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";

const chartData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4780 },
  { name: "May", revenue: 5890 },
  { name: "Jun", revenue: 6390 },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(0);
  const [books, setBooks] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [search, setSearch] = useState("");

  // Animated Counters
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) => (prev < 1245 ? prev + 15 : prev));
      setBooks((prev) => (prev < 320 ? prev + 5 : prev));
      setRevenue((prev) => (prev < 18430 ? prev + 250 : prev));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const payments = [
    { user: "John Doe", book: "React Mastery", amount: 29, status: "Completed", date: "Today" },
    { user: "Jane Smith", book: "Node.js Pro", amount: 35, status: "Pending", date: "Yesterday" },
    { user: "Mike Ross", book: "MongoDB Guide", amount: 22, status: "Failed", date: "2 days ago" },
  ];

  const filteredPayments = payments.filter((p) =>
    p.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 bg-gradient-to-br from-gray-950 via-gray-900 to-black min-h-screen text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back, Boss 👑 — Everything under control.
          </p>
        </div>

        <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
          + Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-8 mb-14">

        <Card icon={<FaUsers />} value={users.toLocaleString()} label="Total Users" color="purple" />

        <Card icon={<FaBook />} value={books} label="Books Uploaded" color="blue" />

        <Card icon={<FaMoneyBillWave />} value={`$${revenue.toLocaleString()}`} label="Revenue" color="green" />

        <Card icon={<FaEnvelope />} value="42" label="Unread Emails" color="red" down />

      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-10 mb-14">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-800 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Revenue Overview</h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-800 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

          <div className="space-y-4">
            <ActionButton text="Add New Book" color="purple" />
            <ActionButton text="View Payments" color="blue" />
            <ActionButton text="Manage Users" color="green" />
            <ActionButton text="Check Emails" color="red" />
          </div>
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-800 shadow-xl">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Payments</h2>

          <input
            type="text"
            placeholder="Search user..."
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none border border-gray-700 focus:border-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-3">User</th>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPayments.map((p, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="py-4">{p.user}</td>
                  <td>{p.book}</td>
                  <td>${p.amount}</td>
                  <td
                    className={
                      p.status === "Completed"
                        ? "text-green-400"
                        : p.status === "Pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {p.status}
                  </td>
                  <td>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

function Card({ icon, value, label, color, down }) {
  return (
    <div className="bg-gray-900/70 backdrop-blur-lg p-7 rounded-3xl border border-gray-800 shadow-xl hover:shadow-purple-600/20 transition duration-300">
      <div className="flex justify-between items-center">
        <div className={`text-3xl text-${color}-500`}>
          {icon}
        </div>

        <span
          className={`flex items-center gap-1 text-sm ${
            down ? "text-red-400" : "text-green-400"
          }`}
        >
          {down ? <FaArrowDown /> : <FaArrowUp />} 12%
        </span>
      </div>

      <h2 className="text-3xl font-bold mt-6">{value}</h2>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function ActionButton({ text, color }) {
  return (
    <button
      className={`w-full bg-${color}-600 hover:bg-${color}-700 py-3 rounded-xl transition duration-300 shadow-lg`}
    >
      {text}
    </button>
  );
}
