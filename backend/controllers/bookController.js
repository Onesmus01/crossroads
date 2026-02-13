import Book from "../models/bookModel.js";
import mongoose from "mongoose";

// Add a new book
export const addBook = async (req, res) => {
  try {
    const { title, description, price, fileUrl, coverImage } = req.body;

    // Basic validation
    if (!title || !description || !price) {
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    if (typeof price !== "number") {
      return res.status(400).json({ message: "Price must be a number" });
    }

    // Create book
    const newBook = await Book.create({
      title,
      description,
      price,
      fileUrl: fileUrl || "",
      coverImage: coverImage || "",
    });

    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    console.error(error);
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
  const { title, description, price, fileUrl, coverImage } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Update fields if provided
    book.title = title ?? book.title;
    book.description = description ?? book.description;
    book.price = price ?? book.price;
    book.fileUrl = fileUrl ?? book.fileUrl;
    book.coverImage = coverImage ?? book.coverImage;

    await book.save();
    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
