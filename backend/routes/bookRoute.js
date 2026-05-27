import express from "express";
import multer from "multer";
import Book from "../models/bookModel.js";
import path from "path";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import authToken from "../middleware/authToken.js";
import isAdmin from "../middleware/adminAuth.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import fs from "fs";
import { Readable } from "stream";

const router = express.Router();

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES =================
router.get("/all-books", getAllBooks);
router.get("/:id", getBookById);

// Add book (PDF + Cover upload)
router.post(
  "/add",
  authToken,
  isAdmin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  addBook
);

// Update book (optional new files)
router.put(
  "/update/:id",
  authToken,
  isAdmin,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateBook
);

router.delete("/:id", authToken, isAdmin, deleteBook);

/**
 * ✅ Check Ownership
 */
router.get('/:id/check-ownership', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    return res.json({
      success: true,
      isPurchased: !!isPurchased,
    });

  } catch (err) {
    console.error('Ownership check error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * ✅ Secure Download (PROXIED — streams file from Cloudinary through backend)
 * This fixes CORS/download issues because the browser talks to YOUR server,
 * and your server talks to Cloudinary server-to-server.
 */
router.get('/:id/download', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    const isFree = book.price === 0;

    if (!isPurchased && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to download',
      });
    }

    if (!book.fileUrl) {
      return res.status(404).json({ success: false, message: 'File not available' });
    }

    // 🔥 PROXY: Fetch file from Cloudinary server-to-server
    const fileRes = await fetch(book.fileUrl);

    if (!fileRes.ok) {
      throw new Error(`Cloudinary fetch failed: ${fileRes.status}`);
    }

    const safeFileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

    // Set headers so browser downloads instead of opening
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileRes.headers.get('content-length') || '');

    // Stream the file body to the client
    if (fileRes.body) {
      Readable.fromWeb(fileRes.body).pipe(res);
    } else {
      // Fallback for older Node versions
      const buffer = await fileRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Download error' });
  }
});

/**
 * ✅ Read Online — returns direct Cloudinary URL
 * The browser can load this in <embed> or <iframe> without CORS issues
 * because it's a direct resource load, not a fetch() call.
 */
router.get('/:id/read', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const isPurchased = user.purchasedBooks?.some(
      (bookId) => bookId.toString() === id
    );

    const isFree = book.price === 0;

    if (!isPurchased && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'Purchase required to read this book',
      });
    }

    if (!book.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Book file not available',
      });
    }

    // Return direct URL — browser can load this in embed/iframe
    return res.json({
      success: true,
      fileUrl: book.fileUrl,
    });

  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ success: false, message: 'Read error' });
  }
});

/**
 * ✅ Download Logging (Analytics)
 */
router.post('/:id/download-log', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    await Book.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 },
    });

    return res.json({ success: true });

  } catch (err) {
    console.error('Download log error:', err);
    res.status(500).json({ success: false });
  }
});

export default router;