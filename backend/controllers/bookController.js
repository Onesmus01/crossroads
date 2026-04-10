import Book from "../models/bookModel.js";
import mongoose from "mongoose";
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Add Book with automatic Cloudinary upload
import streamifier from "streamifier";

// ✅ Upload file buffer to Cloudinary via stream
export const uploadToCloudinaryStream = (buffer, folder, resource_type = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
export const addBook = async (req, res) => {
  try {
    const { title, description, price,author } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // ✅ Upload PDF
    const pdfBuffer = req.files.pdf[0].buffer;
    const pdfUrl = await uploadToCloudinaryStream(pdfBuffer, "books/files", "raw");

    // ✅ Upload Cover if exists
    let coverUrl = "";
    if (req.files.cover) {
      const coverBuffer = req.files.cover[0].buffer;
      coverUrl = await uploadToCloudinaryStream(coverBuffer, "books/covers", "image");
    }

    // ✅ Save to MongoDB
    const newBook = await Book.create({
      title,
      author: author || "Unknown Author", // Placeholder, can be extended to accept author field
      description,
      price: numericPrice,
      fileUrl: pdfUrl,
      coverImage: coverUrl,
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get a single book by ID
export const getBookById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, author } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Update text fields if provided
    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (price !== undefined) book.price = Number(price);
    if (author !== undefined) book.author = author;

    // Handle NEW file uploads (only if user selected new files)
    if (req.files) {
      // Update PDF if new one uploaded
      if (req.files.pdf && req.files.pdf[0]) {
        // Delete old PDF from Cloudinary if exists
        if (book.fileUrl) {
          const publicId = book.fileUrl.split('/').pop().split('.')[0];
          await cloudinary.v2.uploader.destroy(`books/files/${publicId}`, { 
            resource_type: "raw" 
          });
        }
        
        // Upload new PDF
        const pdfBuffer = req.files.pdf[0].buffer;
        const pdfUrl = await uploadToCloudinaryStream(pdfBuffer, "books/files", "raw");
        book.fileUrl = pdfUrl;
      }

      // Update Cover if new one uploaded
      if (req.files.cover && req.files.cover[0]) {
        // Delete old cover from Cloudinary if exists
        if (book.coverImage) {
          const publicId = book.coverImage.split('/').pop().split('.')[0];
          await cloudinary.v2.uploader.destroy(`books/covers/${publicId}`, { 
            resource_type: "image" 
          });
        }
        
        // Upload new cover
        const coverBuffer = req.files.cover[0].buffer;
        const coverUrl = await uploadToCloudinaryStream(coverBuffer, "books/covers", "image");
        book.coverImage = coverUrl;
      }
    }

    await book.save();
    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ---------------- Delete a book ----------------
export const deleteBook = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
