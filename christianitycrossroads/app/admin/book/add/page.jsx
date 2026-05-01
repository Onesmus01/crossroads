'use client';

import { useState } from "react";
import { FaBook, FaUpload, FaDollarSign, FaImage, FaTimes } from "react-icons/fa";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    author: ""
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert(`File too large. Max size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      e.target.value = "";
      return;
    }

    if (type === "pdf") setPdfFile(file);
    else setCoverFile(file);
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

    if (!pdfFile) {
      alert("Please upload a PDF file");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("author", formData.author);
      data.append("pdf", pdfFile);
      if (coverFile) data.append("cover", coverFile);

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", `${backendUrl}/book/add`);
        xhr.withCredentials = true;
        xhr.send(data);
      });

      if (result.success) {
        alert("Book added successfully!");
        setFormData({ title: "", description: "", price: "", author: "" });
        setPdfFile(null);
        setCoverFile(null);
        setUploadProgress(0);
        document.getElementById("pdf-input").value = "";
        document.getElementById("cover-input").value = "";
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error adding book");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaBook className="text-2xl text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Add New Book</h1>
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
              min="0"
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Upload PDF File <span className="text-gray-400 font-normal">(Max 50MB)</span>
          </label>
          <div className="relative">
            <FaUpload className="absolute left-3 top-3 text-gray-400" />
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, "pdf")}
              required
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          {pdfFile && (
            <div className="mt-2 flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-purple-700 truncate max-w-[80%]">
                {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
              </span>
              <button type="button" onClick={() => clearFile("pdf")} className="text-purple-400 hover:text-purple-600">
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* Cover Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Upload Cover Image <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FaImage className="absolute left-3 top-3 text-gray-400" />
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "cover")}
              className="w-full border rounded-lg px-10 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          {coverFile && (
            <div className="mt-2 flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-purple-700 truncate max-w-[80%]">
                {coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)
              </span>
              <button type="button" onClick={() => clearFile("cover")} className="text-purple-400 hover:text-purple-600">
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {loading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding Book..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}