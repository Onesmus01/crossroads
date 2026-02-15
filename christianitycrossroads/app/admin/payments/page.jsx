"use client";

import { useState, useEffect } from "react";

let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${backendUrl}/payment/all-payments`, {
          method: "GET",
          credentials: "include", // include cookies if you have auth
        });

        const data = await res.json();

        if (data.payments && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          alert("No payments found");
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        alert("Error fetching payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Payments</h2>

      {loading ? (
        <p>Loading payments...</p>
      ) : payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Book</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Amount (KES)</th>
              <th className="border p-2">Mpesa Receipt</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="text-center">
                <td className="border p-2">{p.user?.name || "Unknown"}</td>
                <td className="border p-2">{p.book?.title || "Unknown"}</td>
                <td className="border p-2">{p.phone}</td>
                <td className="border p-2">{p.amount}</td>
                <td className="border p-2">{p.mpesaReceipt}</td>
                <td className="border p-2">{p.status}</td>
                <td className="border p-2">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
