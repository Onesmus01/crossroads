"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBook, FaUpload, FaDollarSign, FaImage, FaTimes, FaFilePdf } from "react-icons/fa";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function UpdateBookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    author: "",
  });

  const [existingFiles, setExistingFiles] = useState({
    fileUrl: null,
    coverImage: null,
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
          setExistingFiles({
            fileUrl: data.book.fileUrl || null,
            coverImage: data.book.coverImage || null,
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    if (type === "pdf" && file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      e.target.value = "";
      return;
    }
    if (type === "cover" && !file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      e.target.value = "";
      return;
    }

    if (type === "pdf") {
      setPdfFile(file);
    } else {
      setCoverFile(file);
    }
  };

  const clearFile = (type) => {
    if (type === "pdf") {
      setPdfFile(null);
      document.getElementById("pdf-input").value = "";
    } else {
      setCoverFile(null);
      document.getElementById("cover-input").value = "";
    }
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
      
      // Only append files if selected
      if (pdfFile) data.append("pdf", pdfFile);
      if (coverFile) data.append("cover", coverFile);

      // Use POST with _method=PUT if your backend has issues with PUT + multipart
      // Or use PUT directly if supported
      const res = await fetch(`${backendUrl}/book/update/${bookId}`, {
        method: "PUT", // Change to "POST" if your backend doesn't support PUT with FormData
        body: data,
        credentials: "include",
        // Don't set Content-Type header - browser sets it automatically with boundary
      });

      const result = await res.json();

      if (res.ok) {
        alert("Book updated successfully!");
        router.push("/admin/book");
      } else {
        alert(result.message || "Failed to update book");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating book");
    }

    setLoading(false);
  };

  // Helper to get filename from URL
  const getFileName = (url) => {
    if (!url) return null;
    return url.split("/").pop();
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
          
          {/* Show existing file */}
          {existingFiles.fileUrl && !pdfFile && (
            <div className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              <span className="text-sm text-gray-600 truncate">
                Current: {getFileName(existingFiles.fileUrl)}
              </span>
            </div>
          )}

          {/* Show new file selection */}
          {pdfFile ? (
            <div className="mb-2 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                <span className="text-sm text-purple-700">{pdfFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => clearFile("pdf")}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <FaUpload className="absolute left-3 top-3 text-gray-400" />
              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, "pdf")}
                className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          )}
        </div>

        {/* Cover Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Upload Cover Image</label>
          
          {/* Show existing cover */}
          {existingFiles.coverImage && !coverFile && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Current cover:</p>
              <img
                src={`${backendUrl}${existingFiles.coverImage}`}
                alt="Current cover"
                className="h-32 w-24 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Show new cover selection */}
          {coverFile ? (
            <div className="mb-2 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaImage className="text-purple-500" />
                <span className="text-sm text-purple-700">{coverFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => clearFile("cover")}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <FaImage className="absolute left-3 top-3 text-gray-400" />
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "cover")}
                className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating Book..." : "Update Book"}
        </button>
      </form>
    </div>
  );
}