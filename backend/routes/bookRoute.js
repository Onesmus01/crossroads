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
 * ✅ Secure Download — Fetches from Cloudinary and sends as buffer
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

    const fileRes = await fetch(book.fileUrl);

    if (!fileRes.ok) {
      throw new Error(`Cloudinary returned ${fileRes.status}`);
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const safeFileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Download error: ' + err.message });
  }
});

/**
 * ✅ Read Online — Serves PDF inline (for browser embed/iframe)
 * Same as download but with inline disposition and no filename forcing
 */
router.get('/:id/view', authToken, async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'File not available' });
    }

    const fileRes = await fetch(book.fileUrl);

    if (!fileRes.ok) {
      throw new Error(`Cloudinary returned ${fileRes.status}`);
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // inline = browser shows it, doesn't force download
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (err) {
    console.error('View error:', err);
    res.status(500).json({ success: false, message: 'View error: ' + err.message });
  }
});

/**
 * ✅ Read Online — Returns JSON with fileUrl (for direct access fallback)
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
 * ✅ Download Logging
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