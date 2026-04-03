"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBook, FaUpload, FaDollarSign, FaImage } from "react-icons/fa";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function UpdateBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id"); // expecting /update-book?id=BOOK_ID

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    author: "",
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing book data
  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        const res = await fetch(`${backendUrl}/book/${bookId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.book) {
          setFormData({
            title: data.book.title || "",
            description: data.book.description || "",
            price: data.book.price || "",
            author: data.book.author || "",
          });
        } else {
          alert(data.message || "Failed to fetch book");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching book data");
      }
    };

    fetchBook();
  }, [bookId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("author", formData.author);
      if (pdfFile) data.append("pdf", pdfFile);
      if (coverFile) data.append("cover", coverFile);

      const res = await fetch(`${backendUrl}/book/update/${bookId}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        alert("Book updated successfully!");
        router.push("/admin/books"); // redirect to books list
      } else {
        alert(result.message || "Failed to update book");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating book");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaBook className="text-2xl text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Update Book</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Book Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Price (KES)</label>
          <div className="relative">
            <FaDollarSign className="absolute left-3 top-3 text-gray-400" />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Upload PDF File</label>
          <div className="relative">
            <FaUpload className="absolute left-3 top-3 text-gray-400" />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Cover Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Upload Cover Image</label>
          <div className="relative">
            <FaImage className="absolute left-3 top-3 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          {loading ? "Updating Book..." : "Update Book"}
        </button>
      </form>
    </div>
  );
}