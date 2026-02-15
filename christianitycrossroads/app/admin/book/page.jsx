"use client";

import { useState, useEffect } from "react";
import BookTable from "@/components/admin/BookTable";

let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function BooksPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${backendUrl}/book/all-books`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setBooks(data.books || []);
        } else {
          alert(data.message || "Failed to fetch books");
          console.error("Error fetching books:", data);
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching books");
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/book/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setBooks((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert(data.message || "Failed to delete book");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting book");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Books</h2>
      <BookTable books={books} onDelete={handleDelete} />
    </div>
  );
}
