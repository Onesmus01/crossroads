"use client";

import { useState, useEffect } from "react";
import BookTable from "@/components/admin/BookTable";

export default function BooksPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fetch books from your backend
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Books</h2>
      <BookTable books={books} onDelete={handleDelete} />
    </div>
  );
}
