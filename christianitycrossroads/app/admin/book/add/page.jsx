"use client";

import { useState } from "react";
import { FaBook, FaUpload, FaDollarSign, FaImage } from "react-icons/fa";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert("Please upload a PDF file");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("pdf", pdfFile);      // must match multer field
      if (coverFile) {
        data.append("cover", coverFile); // must match multer field
      }

      const res = await fetch(`${backendUrl}/book/add`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        alert("Book added successfully!");
        setFormData({
          title: "",
          description: "",
          price: "",
        });
        setPdfFile(null);
        setCoverFile(null);
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding book");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBook className="text-2xl text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          Add New Book
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Book Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
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
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Price (KES)
          </label>
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
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Upload PDF File
          </label>
          <div className="relative">
            <FaUpload className="absolute left-3 top-3 text-gray-400" />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              required
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Upload Cover Image
          </label>
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
          {loading ? "Adding Book..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}
