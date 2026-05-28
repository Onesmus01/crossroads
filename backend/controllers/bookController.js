import Book from "../models/bookModel.js";
import mongoose from "mongoose";
import cloudinary from 'cloudinary';
import Payment from "../models/paymentModel.js";
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
  const pdfFile = req.files?.pdf?.[0];
  const coverFile = req.files?.cover?.[0];

  try {
    const { title, description, price, author } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    if (!pdfFile) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Upload PDF from disk
    const pdfResult = await cloudinary.v2.uploader.upload(pdfFile.path, {
      folder: "books/files",
      resource_type: "raw",
    });

    // Upload Cover from disk (if exists)
    let coverUrl = "";
    if (coverFile) {
      const coverResult = await cloudinary.v2.uploader.upload(coverFile.path, {
        folder: "books/covers",
        resource_type: "image",
      });
      coverUrl = coverResult.secure_url;
    }

    // Save to MongoDB
    const newBook = await Book.create({
      title,
      author: author || "Unknown Author",
      description,
      price: numericPrice,
      fileUrl: pdfResult.secure_url,
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
  } finally {
    // Clean up temp files
    if (pdfFile?.path && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
    if (coverFile?.path && fs.existsSync(coverFile.path)) fs.unlinkSync(coverFile.path);
  }
};
// Get all books

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    // Check auth header to optionally inject isPurchased per book
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.TOKEN_SECRET_KEY);
        userId = decoded._id || decoded.id;
      } catch {
        userId = null;
      }
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId).lean();
    }

    const enrichedBooks = books.map(book => {
      const bookObj = book.toObject();
      let isPurchased = false;

      if (user?.purchasedBooks) {
        isPurchased = user.purchasedBooks.some(
          id => id.toString() === bookObj._id.toString()
        );
      }

      return {
        ...bookObj,
        isPurchased,
      };
    });

    res.json({ books: enrichedBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyBooks = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return just the IDs — frontend builds the Set from this
    const bookIds = (user.purchasedBooks || []).map(id => id.toString());

    res.json({
      success: true,
      bookIds,
      count: bookIds.length,
    });

  } catch (error) {
    console.error('getMyBooks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Get a single book by ID
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js";

export const getBookById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let isPurchased = false;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.TOKEN_SECRET_KEY);
        const userId = decoded._id || decoded.id;

        // 1. Check purchasedBooks array (fast)
        const user = await User.findById(userId);
        if (user?.purchasedBooks) {
          isPurchased = user.purchasedBooks.some(
            (bookId) => bookId.toString() === id
          );
        }

        // 2. Fallback: check Payment collection + auto-heal user record
        if (!isPurchased) {
          const purchase = await Payment.findOne({
            user: userId,      // ← matches your schema
            book: id,          // ← matches your schema
            status: 'success'  // ← matches your schema
          });

          if (purchase) {
            isPurchased = true;
            // Heal: add to purchasedBooks so next request is instant
            await User.findByIdAndUpdate(userId, {
              $addToSet: { purchasedBooks: id }
            });
          }
        }
      } catch (err) {
        isPurchased = false;
      }
    }

    res.json({
      book: {
        ...book.toObject(),
        isPurchased,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, author } = req.body;
  const pdfFile = req.files?.pdf?.[0];
  const coverFile = req.files?.cover?.[0];

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

    // Handle NEW file uploads
    if (req.files) {
      // Update PDF if new one uploaded
      if (pdfFile) {
        // Delete old PDF from Cloudinary if exists
        if (book.fileUrl) {
          const publicId = book.fileUrl.split('/').pop().split('.')[0];
          await cloudinary.v2.uploader.destroy(`books/files/${publicId}`, { 
            resource_type: "raw" 
          });
        }
        
        // Upload new PDF from disk
        const pdfResult = await cloudinary.v2.uploader.upload(pdfFile.path, {
          folder: "books/files",
          resource_type: "raw",
        });
        book.fileUrl = pdfResult.secure_url;
      }

      // Update Cover if new one uploaded
      if (coverFile) {
        // Delete old cover from Cloudinary if exists
        if (book.coverImage) {
          const publicId = book.coverImage.split('/').pop().split('.')[0];
          await cloudinary.v2.uploader.destroy(`books/covers/${publicId}`, { 
            resource_type: "image" 
          });
        }
        
        // Upload new cover from disk
        const coverResult = await cloudinary.v2.uploader.upload(coverFile.path, {
          folder: "books/covers",
          resource_type: "image",
        });
        book.coverImage = coverResult.secure_url;
      }
    }

    await book.save();
    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    // Clean up temp files
    if (pdfFile?.path && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
    if (coverFile?.path && fs.existsSync(coverFile.path)) fs.unlinkSync(coverFile.path);
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


export const downloadBook = async (req, res) => {
  try {
    // Use whatever your auth middleware sets: req.user.id or req.userId
    const userId = req.userId || req.user?.id;
    const bookId = req.params.id;

    // FIXED field names to match Payment schema
    const purchase = await Payment.findOne({
      user: userId,        // was userId
      book: bookId,        // was bookId
      status: 'success'     // was paymentStatus
    });

    if (!purchase) {
      return res.status(403).json({ success: false, message: 'Purchase required' });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.fileUrl) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    return res.json({
      success: true,
      fileUrl: book.fileUrl,
      fileName: `${book.title}.pdf`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const readBookOnline = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id;
    const bookId = req.params.id;

    // FIXED field names
    const purchase = await Payment.findOne({
      user: userId,
      book: bookId,
      status: 'success'
    });

    if (!purchase) {
      return res.status(403).json({ success: false, message: 'Purchase required' });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.fileUrl) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Stream or proxy PDF
    res.json({ success: true, fileUrl: book.fileUrl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

