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

const router = express.Router();


// ================= MULTER CONFIG =================

// Storage config

const storage = multer.memoryStorage();
export const upload = multer({ storage });


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
  "/:id",
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // 🔥 FIX: ObjectId comparison
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
 * ✅ Secure Download (with ownership check)
 */
router.get('/:id/download', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
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

    // 🔥 FIX: ObjectId comparison
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

    // 🔥 Clean filename
    const safeFileName = `${book.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.pdf`;

    return res.json({
      success: true,
      fileUrl: book.fileUrl,
      fileName: safeFileName,
    });

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Download error' });
  }
});


/**
 * ✅ Download Logging (Analytics)
 */
router.post('/:id/download-log', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID' });
    }

    // 🔥 Example: increment download count (optional)
    await Book.findByIdAndUpdate(id, {
      $inc: { downloadCount: 1 },
    });

    // You can also log user downloads in a separate collection if needed

    return res.json({ success: true });

  } catch (err) {
    console.error('Download log error:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * ✅ Read Online (secure viewer access)
 */
router.get('/:id/read', authToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
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

    // 🔥 Check ownership
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

    // 🔥 Viewer-friendly URL (Google Docs viewer)
    const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(book.fileUrl)}`;

    return res.json({
      success: true,
      readerUrl: viewerUrl,
    });

  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ success: false, message: 'Read error' });
  }
});

export default router;
